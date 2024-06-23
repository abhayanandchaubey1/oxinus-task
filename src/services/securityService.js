import { Container } from 'typedi';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import config from '../config';
import {
  HttpException, encrypt, decrypt,
  formatErrorResponse, STATUS,
} from '../utils';
import {
  Authentication, Right, TokenValidationResult, Role,
} from '../auth';
import UserService from './userService';


class SecurityService {
    static TOKEN_EXPIRATION_MINUTES = 1;

    static SAME_IP_TOKEN_EXPIRATION_MINUTES = 60;

    static MAX_LOGIN_ATTEMPTS = 3;

    static ACCOUNT_BLOCK_HOURS = 1;

    constructor() {
      this.txs = Container.get('DbTransactions');
      this.userService = Container.get(UserService);
    }

    async updateUserWrongLoginCount(user) {
      let wrongLoginCount = (user.wrongLoginCount || 0) + 1;
      if (wrongLoginCount > SecurityService.MAX_LOGIN_ATTEMPTS) wrongLoginCount = 1;
      await this.userService.updateUserWrongLoginCount(wrongLoginCount, user.id);
    }

    async postLoginActions(client, userId) {
      await this.userService.markUserLogin(client, userId);
    }

    async login(ipAddress, email, password) {
      return await this.txs.withTransaction(async (client) => {
        const messageKey = 'login';
        const invalidLoginErr = new HttpException.Forbidden(formatErrorResponse(messageKey, 'invalidCredentials'));
        const user = await this.userService.findUserByEmail(client, email);
        if (!user || !user.passwordHash) {
          throw invalidLoginErr;
        }

        if (SecurityService.accountBlocked(user)) {
          throw new HttpException.Forbidden(formatErrorResponse(messageKey, 'accountBlocked'));
        }

        const validPassword = await user.passwordHash.check(password);

        if (validPassword && await this.canLogin(user)) {
          const roleIds = user.roles.map((role) => role.getId());
          const type = Math.max(...roleIds);
          const token = SecurityService.createToken(ipAddress,
            user.email, config.authTokens.audience.app,
            type, !(user.lastLogin));
          await this.postLoginActions(client, user.id);
          return { token };
        }
        this.updateUserWrongLoginCount(user);
        throw invalidLoginErr;
      });
    }

    async thirdPartyLogin(ipAddress, thirdPartyUser) {
      const messageKey = 'thirdParyLogin';
      return this.txs.withTransaction(async (client) => {
        let payload = {};
        const { type: loginType, token: loginToken } = thirdPartyUser;
        if (loginType === THIRD_PARTY_LOGIN_TYPES.GOOGLE) {
          payload = await SecurityService.validateGoogleToken(loginToken);
        } else if (loginType === THIRD_PARTY_LOGIN_TYPES.FACEBOOK) {
          payload = await SecurityService.validateFacebookToken(loginToken);
        }

        if (!payload || !payload.email) {
          throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'invalidToken'));
        }

        let user = await this.dao.findUserByUsername(client, payload.email);
        if (!user) {
          const profilePic = await SecurityService.uploadProfilePicFromUrl(
            payload.profilePic, payload,
          );
          const defaultCurrency = await this.currencyService.findDefaultCurrency();
          const id = await this.dao.signUp(client,
            {
              ...payload,
              profilePic,
              status: USER_STATUS.ACTIVE,
              emailVerified: true,
              currencyId: defaultCurrency.id,
            });
          user = await this.dao.findUserById(client, id);
        }

        if (!(await this.canLogin(user)) || !user.isCustomer) {
          throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'notAllowed'));
        }

        const roleIds = user.roles.map((role) => role.getId());
        const type = Math.max(...roleIds);
        const token = SecurityService.createToken(ipAddress, user.username,
          config.authTokens.audience.app, type, !(user.lastLogin));
        await this.dao.markUserLogin(client, user.id);
        await this.dao.addThirdPartyLogin(client, user.id,
          payload.socialId, loginType);

        return token;
      });
    }

    async ssoLogin(ipAddress, employeeDto) {
      const messageKey = 'ssoLogin';
      return this.txs.withTransaction(async (client) => {
        let payload = {};
        const { type: loginType, token: loginToken } = employeeDto;
        if (loginType === SSO_LOGIN_TYPES.GSUITE) {
          payload = await SecurityService.validateGoogleToken(loginToken, true);
        }

        if (!payload || !payload.email) {
          throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'invalidToken'));
        }

        const company = await this.companyService.findCompanyByGsuiteDomain(client,
          payload.gsuiteDomain);

        if (!company) {
          throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'notExist'));
        }

        if (!company.gsuiteActive) {
          throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'notAllowed'));
        }

        let user = await this.dao.findUserByUsername(client, payload.email);

        if (!user) {
          await this.restrictionService.checkAllowedAction(messageKey,
            ORDER_OWNER_TYPES.COMPANY, company.id, API_ACTIONS.MODIFY_ENTITY,
            RESTRICTION_CODES.EMPLOYEE_COUNT, 1);

          const profilePic = await SecurityService.uploadProfilePicFromUrl(
            payload.profilePic, payload,
          );

          const leaveCount = await this.companyLeaveService.getCompanyLeaveCountById(
            client, company.id,
          );

          const employee = await this.employeeService.createEmployee(client, {
            ...payload,
            profilePic,
            companyId: company.id,
            leaveCount,
            active: true,
            emailVerified: true,
          });

          user = await this.dao.findUserById(client, employee.id);
        }

        if (!(await this.canLogin(user)) || !user.isCompanyEmployee) {
          throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'notAllowed'));
        }

        const roleIds = user.roles.map((role) => role.getId());
        const type = Math.max(...roleIds);
        const token = SecurityService.createToken(ipAddress, user.username,
          config.authTokens.audience.app, type, !(user.lastLogin));
        await this.dao.markUserLogin(client, user.id);
        await this.dao.addThirdPartyLogin(client, user.id,
          payload.socialId, loginType);

        return token;
      });
    }

    /** Used to signup only mobile app users */
    async signUp(ipAddress, signUpDto) {
      return await this.txs.withTransaction(async (client) => {
        const user = await this.userService.createUser(client,
          { ...signUpDto, role: Role.roleValues.USER });
        const token = SecurityService.createToken(ipAddress, user.email,
          config.authTokens.audience.app, !(user.lastLogin));
        await this.userService.markUserLogin(client, user.id);
        return { token };
      });
    }


    static accountBlocked(user) {
      let blocked = false;
      if ((user.wrongLoginCount >= SecurityService.MAX_LOGIN_ATTEMPTS)
      && user.lastWrongLoginAttempt) {
        const bolckedTill = user.lastWrongLoginAttempt.clone().add(SecurityService.ACCOUNT_BLOCK_HOURS, 'hour');
        blocked = bolckedTill.isAfter();
      }
      return blocked;
    }

    async canLogin(user) {
      const messageKey = 'user';
      if (user.status !== STATUS.ACTIVE) {
        throw new HttpException.Unauthorized(formatErrorResponse(messageKey, 'inactiveUser'));
      }

      return Authentication.hasRight(user, Right.general.LOGIN);
    }

    static updateToken(ipAddress, email, aud) {
      return SecurityService.createToken(ipAddress, email, aud);
    }

    static createToken(ipAddress, email, aud, firstLogin) {
      const payload = {
        exp: SecurityService.anyIpAddressExpiryTimestamp(),
        iat: SecurityService.currentTimestamp(),
        nbf: SecurityService.currentTimestamp(),
        iss: config.authTokens.issuer,
        sub: encrypt(email),
        aud: config.authTokens.audience.web,
        version: config.authTokens.version,
        exp2: {
          ip: ipAddress,
          time: SecurityService.sameIpAddressExpiryTimestamp(),
        },
        firstLogin: firstLogin || undefined,
      };
      if (aud && aud === config.authTokens.audience.app) {
        payload.aud = config.authTokens.audience.app;
        delete payload.exp;
        delete payload.exp2;
      }

      return jwt.sign(payload, config.authTokens.privateKey,
        { algorithm: config.authTokens.algorithm });
    }

    static currentTimestamp() {
      return moment.utc().unix();
    }

    static anyIpAddressExpiryTimestamp() {
      return moment()
        .add(SecurityService.TOKEN_EXPIRATION_MINUTES, 'minute')
        .unix();
    }

    static sameIpAddressExpiryTimestamp() {
      return moment()
        .add(SecurityService.SAME_IP_TOKEN_EXPIRATION_MINUTES, 'minute')
        .unix();
    }

    async validateToken(ip, payload) {
      if ((payload.aud !== config.authTokens.audience.app)
           && SecurityService.isExpired(ip, payload, moment())) {
        return new TokenValidationResult(TokenValidationResult.tokenValidationStatus.EXPIRED);
      } if (SecurityService.isOldVersion(payload)) {
        return new TokenValidationResult(TokenValidationResult.tokenValidationStatus.OLD_VERSION);
      }

      try {
        const email = decrypt(payload.sub);
        const user = await this.txs.withTransaction(async (client) => (
          this.userService.findUserByEmail(client, email)
        ));

        if (!user || (user.status !== STATUS.ACTIVE)) {
          return new TokenValidationResult(
            TokenValidationResult.tokenValidationStatus.INACTIVE_USER,
          );
        }

        return new TokenValidationResult(TokenValidationResult.tokenValidationStatus.VALID, user);
      } catch (e) {
        return new TokenValidationResult(TokenValidationResult.tokenValidationStatus.INVALID_USER);
      }
    }

    static isExpired(ip, payload, currentTime) {
      return (!SecurityService.isValidForGeneralExpiration(currentTime, payload)
      && !SecurityService.isValidForSameIpExpiration(currentTime, ip, payload));
    }

    static isValidForGeneralExpiration(currentTime, payload) {
      return moment.unix(payload.exp).isAfter(currentTime);
    }

    static isValidForSameIpExpiration(currentTime, ip, payload) {
      return (ip === payload.exp2.ip) && (moment.unix(payload.exp2.time).isAfter(currentTime));
    }

    static isOldVersion(payload) {
      return config.authTokens.version !== payload.version;
    }
}


export default SecurityService;
