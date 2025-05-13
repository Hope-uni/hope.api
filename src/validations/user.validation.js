const joi = require('joi');
const messages= require('../utils/messages.utils');


const createUserObjectFields = {
  username: joi.string().strict().trim().required().min(3, 'utf8').max(15, 'utf8').messages({
    'any.required': messages.user.fields.username.required,
    'string.base': messages.user.fields.username.base,
    'string.trim': messages.user.fields.username.trim,
    'string.empty': messages.user.fields.username.empty,
    'string.min': messages.user.fields.username.characters,
    'string.max': messages.user.fields.username.characters,
  }),
  email: joi.string().strict().trim().email().min(3, 'utf8').max(50, 'utf8').required().messages({
    'any.required': messages.user.fields.email.required,
    'string.base': messages.user.fields.email.base,
    'string.email': messages.user.fields.email.format,
    'string.empty': messages.user.fields.email.empty,
    'string.trim': messages.user.fields.email.trim,
    'string.min': messages.user.fields.email.characters,
    'string.max': messages.user.fields.email.characters,
  }),
};

const updateUserObjectFields = {
  username: joi.string().strict().trim().min(3, 'utf8').max(15, 'utf8').empty(' ').messages({
    'string.base': messages.user.fields.username.base,
    'string.empty': messages.user.fields.username.empty,
    'string.trim': messages.user.fields.username.trim,
    'string.min': messages.user.fields.username.characters,
    'string.max': messages.user.fields.username.characters,
  }),
  email: joi.string().strict().trim().email().min(3, 'utf8').max(50, 'utf8').empty(' ').messages({
    'string.trim': messages.user.fields.email.trim,
    'string.email': messages.user.fields.email.format,
    'string.empty': messages.user.fields.email.empty,
    'string.min': messages.user.fields.email.characters,
    'string.max': messages.user.fields.email.characters,
  }),
};

const roleUserObjectFields = {
  userId: joi.number().positive().strict().required().messages({
    'any.required': messages.user.fields.id.required,
    'number.base': messages.user.fields.id.base,
    'number.positive': messages.user.fields.id.positive,
  }),
  roleId: joi.number().positive().strict().required().messages({
    'any.required': messages.role.fields.id.required,
    'number.base': messages.role.fields.id.base,
    'number.positive': messages.role.fields.id.positive,
  }),
};

const createUserValidation = (data) => {
  const schema = joi.object().keys(createUserObjectFields).unknown(false).options({ abortEarly: false }).messages({
    'object.unknown': messages.generalMessages.unknown_object,
  });
  return schema.validate(data);
};

const updateUserValidation = (data) => {
  const schema = joi.object().keys(updateUserObjectFields).unknown(false).options({ abortEarly: false }).messages({
    'object.unknown': messages.generalMessages.unknown_object,
  });
  return schema.validate(data);
};

const roleUserValidation = (data) => {
  const schema = joi.object().keys(roleUserObjectFields).unknown(false).options({ abortEarly: false }).messages({
    'object.unknown': messages.generalMessages.unknown_object,
  });
  return schema.validate(data);
}

module.exports = {
  createUserValidation,
  updateUserValidation,
  roleUserValidation,
  createUserObjectFields,
  updateUserObjectFields
}
