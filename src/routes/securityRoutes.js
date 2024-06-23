import { Container } from 'typedi';
import { routes, featureLevel, publicPost } from './utils';
import { Right } from '../auth';
import { SecurityService, UserService } from '../services';
import {
  loginSchema, signupSchema, ssoLoginSchema, thirdPartyLoginSchema, updateUserProfileSchema
} from '../models';

/**
  * Login/Signup end point
* */
export default () => {
  publicPost(
    featureLevel.production,
    routes.security.SIGN_UP,
    async (req) => {
      const service = Container.get(SecurityService);
      const userSignup = await signupSchema.validateAsync(req.body);
      return await service.signUp(req.ip, userSignup);
    },
  );

  publicPost(
    featureLevel.production,
    routes.security.LOGIN,
    async (req) => {
      const service = Container.get(SecurityService);
      const { email, password } = await loginSchema.validateAsync(req.body);
      return await service.login(req.ip, email, password);
    },
  );

  publicPost(
    featureLevel.production,
    routes.security.LOGIN_THIRD_PARTY,
    async (req) => {
      const service = Container.get(SecurityService);
      const thirdPartyUser = await thirdPartyLoginSchema.validateAsync(req.body);
      const token = await service.thirdPartyLogin(req.ip, thirdPartyUser);
      return { token };
    },
  );

  
  publicPost(
    featureLevel.production,
    routes.security.SOCIAL_LOGIN,
    async (req) => {
      const service = Container.get(SecurityService);
      const employeeDto = await ssoLoginSchema.validateAsync(req.body);
      const token = await service.ssoLogin(req.ip, employeeDto);
      return { token };
    },
  );
};
