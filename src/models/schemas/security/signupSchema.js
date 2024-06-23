import Joi from 'joi';
import {
  requiredStringValidator, requiredEmailValidator,
} from '../../../utils';


export default Joi.object(((messageKey) => ({
  firstName: requiredStringValidator(messageKey, 'firstName'),
  lastName: requiredStringValidator(messageKey, 'lastName'),
  email: requiredEmailValidator(messageKey, 'email'),
  password: requiredStringValidator(messageKey, 'password'),
}))('signup')).options({ stripUnknown: true });
