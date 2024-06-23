const Joi = require('@hapi/joi');
const {
  joiStringError, requiredStringValidator,
  THIRD_PARTY_LOGIN_TYPES,
} = require('../../../utils');

module.exports = Joi.object(((messageKey) => {
  const thirdPartyLoginTypes = Object.keys(THIRD_PARTY_LOGIN_TYPES)
    .map((key) => THIRD_PARTY_LOGIN_TYPES[key]);

  return {
    token: requiredStringValidator(messageKey, 'token'),
    type: Joi.string().valid(...thirdPartyLoginTypes).required()
      .messages(joiStringError(messageKey, 'type')),
  };
})('thirdParyLogin')).options({ stripUnknown: true });
