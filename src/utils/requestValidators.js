import Joi from 'joi';
import moment from 'moment';
import {
  joiStringError, joiNumberError, joiBooleanError, joiEmailError,
  joiDateError,
} from './apiResponses';


export const idValidator = () => (
  Joi.number().integer().positive()
);

export const requiredIdValidator = (messageKey, key) => (
  idValidator().required().messages(joiNumberError(messageKey, key))
);

export const nullableIdValidator = (messageKey, key) => (
  idValidator().allow(null).messages(joiNumberError(messageKey, key))
);

export const moneyValidator = () => (
  Joi.number().positive().precision(2)
);

export const requiredMoneyValidator = (messageKey, key) => (
  moneyValidator().required().messages(joiNumberError(messageKey, key))
);

export const nullableMoneyValidator = (messageKey, key) => (
  moneyValidator().allow(null).messages(joiNumberError(messageKey, key))
);

export const stringValidator = (messageKey, key) => (
  Joi.string().messages(joiStringError(messageKey, key))
);


export const requiredStringValidator = (messageKey, key) => (
  Joi.string().required().messages(joiStringError(messageKey, key))
);

export const nullableStringValidator = (messageKey, key) => (
  Joi.string().allow(null).messages(joiStringError(messageKey, key))
);

export const dateValidator = ({ onlyPast } = {}) => {
  let validator = Joi.date().iso().raw();
  if (onlyPast) {
    validator = validator.max('now');
  }
  return validator;
};

export const requiredDateValidator = (messageKey, key, options) => (
  dateValidator(options).required().messages(joiDateError(messageKey, key))
);

export const nullableDateValidator = (messageKey, key, options) => (
  dateValidator(options).allow(null).messages(joiDateError(messageKey, key))
);

export const validateEndDate = (startDateKey) => (value, helpers) => {
  let startDate;
  if (helpers && helpers.state && helpers.state.ancestors
    && helpers.state.ancestors[0]) {
    startDate = helpers.state.ancestors[0][startDateKey];
  }

  if (startDate && !value) {
    return helpers.error('any.invalid');
  }

  if (startDate && value && moment(startDate).isAfter(moment(value))) {
    return helpers.error('any.invalid');
  }

  return value;
};

export const emailValidator = () => (
  Joi.string().lowercase().email()
);

export const requiredEmailValidator = (messageKey, key) => (
  emailValidator().required().messages(joiEmailError(messageKey, key))
);

export const nullableEmailValidator = (messageKey, key) => (
  emailValidator().allow(null).messages(joiEmailError(messageKey, key))
);

export const numberValidator = (messageKey, key) => (
  Joi.number().messages(joiNumberError(messageKey, key))
);

export const requiredNumberValidator = (messageKey, key) => (
  Joi.number().required().messages(joiNumberError(messageKey, key))
);

export const nullableNumberValidator = (messageKey, key) => (
  Joi.number().allow(null).messages(joiNumberError(messageKey, key))
);

export const booleanValidator = (messageKey, key) => (
  Joi.boolean().messages(joiBooleanError(messageKey, key))
);

export const requiredBooleanValidator = (messageKey, key) => (
  Joi.boolean().required().messages(joiBooleanError(messageKey, key))
);

export const requiredEnumValidator = (options = [], messageKey, key) => (
  Joi.string().valid(...options).required()
    .messages(joiStringError(messageKey, key))
);

export const nullableEnumValidator = (options = [], messageKey, key) => (
  Joi.string().valid(...options).allow(null)
    .messages(joiStringError(messageKey, key))
);

export const enumValidator = (options = [], messageKey, key) => (
  Joi.string().valid(...options)
    .messages(joiStringError(messageKey, key))
);

export const requiredRegexValidator = (pattern, messageKey, key) => (
  Joi.string().regex(pattern).required()
    .messages(joiStringError(messageKey, key))
);

export const nullableRegexValidator = (pattern, messageKey, key) => (
  Joi.string().regex(pattern).allow(null)
    .messages(joiStringError(messageKey, key))

);

export const regexValidator = (pattern, messageKey, key) => (
  Joi.string().regex(pattern)
    .messages(joiStringError(messageKey, key))
);
