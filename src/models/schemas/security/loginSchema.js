import Joi from 'joi';
import config from '../../../config';
import { requiredStringValidator, nullableEnumValidator } from '../../../utils';

export default Joi.object(((messageKey) => ({
  email: requiredStringValidator(messageKey, 'email'),
  password: requiredStringValidator(messageKey, 'password'),
  aud: nullableEnumValidator([
    config.authTokens.audience.web,
    config.authTokens.audience.app],
  messageKey, 'aud'),
}))('login')).options({ stripUnknown: true });
