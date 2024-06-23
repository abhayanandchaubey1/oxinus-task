/* eslint-disable consistent-return */
import jwt from 'jsonwebtoken';
import { Container } from 'typedi';
import config from '../../config';
import { HttpException, formatErrorResponse } from '../../utils';
import { SecurityService } from '../../services';
import { TokenValidationResult, Authentication } from '../../auth';

/**
 * We are assuming that the JWT will come in a header with the form
 *
 * Authorization: Bearer ${JWT}
 *
 */

const getTokenFromHeader = (req) => {
  /**
   * @TODO Edge and Internet Explorer do some weird things with the headers
   * So I believe that this should handle more 'edge' cases ;)
   */
  if ((req.headers.authorization
    && req.headers.authorization.split(' ')[0] === 'Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};


const verifyToken = async (req, res, next) => {
  const token = getTokenFromHeader(req);
  const messageKey = 'authToken';
  if (token) {
    jwt.verify(token, config.authTokens.publicKey,
      {
        algorithms: config.authTokens.algorithm,
        issuer: config.authTokens.issuer,
        audience: [config.authTokens.audience.web, config.authTokens.audience.app],
        ignoreExpiration: true,
      },
      async (err, payload) => {
        try {
          if (err) {
            throw err;
          } else {
            const service = Container.get(SecurityService);
            const result = await service.validateToken(req.ip, payload);

            switch (result.status) {
              case TokenValidationResult.tokenValidationStatus.EXPIRED:
                return next(new HttpException.Unauthorized(formatErrorResponse(messageKey, 'expired')));
              case TokenValidationResult.tokenValidationStatus.OLD_VERSION:
                return next(new HttpException.UpgradeRequired(formatErrorResponse(messageKey, 'invalidApiVersion')));
              case TokenValidationResult.tokenValidationStatus.INVALID_USER:
                return next(new HttpException.Unauthorized(formatErrorResponse(messageKey, 'invalidToken')));
              case TokenValidationResult.tokenValidationStatus.INACTIVE_USER:
                return next(new HttpException.Unauthorized(formatErrorResponse(messageKey, 'inactiveUser')));
              case TokenValidationResult.tokenValidationStatus.NO_COMPANY_FOUND:
                return next(new HttpException.Unauthorized(formatErrorResponse(messageKey, 'noCompanyAttached')));
              case TokenValidationResult.tokenValidationStatus.INACTIVE_COMPANY:
                return next(new HttpException.Unauthorized(formatErrorResponse(messageKey, 'inactiveCompany')));
              case TokenValidationResult.tokenValidationStatus.NO_SUBSCRIPTION:
                return next(new HttpException.Unauthorized(formatErrorResponse(messageKey, 'noSubscriptionActive')));
              case TokenValidationResult.tokenValidationStatus.VALID: {
                const { user } = result;
                user.rights = Authentication.userEffectiveRights(user);
                user.tokenAud = payload.aud;
                delete user.passwordHash;
                req.currentUser = { ...user };
                Object.freeze(req.currentUser);
                return next();
              }
              default:
                throw new Error(formatErrorResponse(messageKey, 'invalidStatus'));
            }
          }
        } catch (error) {
          return next(new HttpException.Unauthorized(formatErrorResponse(messageKey, 'invalidToken')));
        }
      });
  } else {
    return next(new HttpException.Unauthorized(formatErrorResponse(messageKey, 'notFound')));
  }
};

export default verifyToken;
