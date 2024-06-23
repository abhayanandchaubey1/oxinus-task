import Joi from 'joi';
import {
  stringValidator,
} from '../../../utils';

export default Joi.object(((messageKey) => ({
  firstName: stringValidator(messageKey, 'firstName'),
  lastName: stringValidator(messageKey, 'lastName'),
}))('updateUserProfile')).options({ stripUnknown: true });
