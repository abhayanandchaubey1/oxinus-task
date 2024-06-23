import { Container } from 'typedi';
import {
  routes, featureLevel, get, put,
} from './utils';
import { Right } from '../auth';
import { UserService } from '../services';
import { updateUserProfileSchema } from '../models';

export default () => {
  get(featureLevel.production,
    Right.user.FETCH_USER_PROFILE,
    routes.user.PROFILE,
    async (req) => {
      const service = Container.get(UserService);
      return await service.fetchUserProfile({ ...req.currentUser });
    });

  put(featureLevel.production,
    Right.user.MODIFY_USER_PROFILE,
    routes.user.PROFILE,
    async (req) => {
      const service = Container.get(UserService);
      const updateDto = await updateUserProfileSchema.validateAsync(req.body);
      return await service.modifyUserProfile(updateDto, { ...req.currentUser });
    });
};
