/* eslint-disable */
import { routes, featureLevel, put } from './utils';
import { Right } from '../auth';

export default () => {
  put(featureLevel.development,
    Right.general.TEST_API,
    routes.test.TEST_ACTION,
    async () => {
      try {
       return {message : 'hii'};
      } catch (error) {
        console.log(error);
        throw error;
      }
    });
};
