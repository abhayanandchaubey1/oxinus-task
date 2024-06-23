const Joi = require('@hapi/joi');
const {
  joiStringError, requiredStringValidator, SSO_LOGIN_TYPES,
} = require('../../../utils');

module.exports = Joi.object(((messageKey) => {
  const ssoLoginTypes = Object.keys(SSO_LOGIN_TYPES)
    .map((key) => SSO_LOGIN_TYPES[key]);

  return {
    token: requiredStringValidator(messageKey, 'token'),
    type: Joi.string().valid(...ssoLoginTypes).required()
      .messages(joiStringError(messageKey, 'type')),
  };
})('ssoLogin')).options({ stripUnknown: true });
