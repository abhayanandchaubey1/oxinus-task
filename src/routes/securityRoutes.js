import { Container } from 'typedi';
import { routes, featureLevel, publicPost } from './utils';
import { SecurityService } from '../services';
import {
  loginSchema, signupSchema,
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
};
