const Joi = require('@hapi/joi');
const {
  stringValidator, emailValidator, nullableDateValidator,
  nullableNumberValidator, joiEmailError, joiStringError,
  idValidator,
} = require('../../../utils');

module.exports = Joi.object(((messageKey) => ({
  firstName: stringValidator(messageKey, 'firstName'),
  lastName: stringValidator(messageKey, 'lastName'),
  email: emailValidator().messages(joiEmailError(messageKey, 'email')),
  dialCode: nullableNumberValidator(messageKey, 'dialCode'),
  phone: nullableNumberValidator(messageKey, 'phone'),
  dateOfBirth: nullableDateValidator(messageKey, 'dateOfBirth')
}))('updateUserProfile')).options({ stripUnknown: true });
