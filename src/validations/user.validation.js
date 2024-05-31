const joi = require('joi');
const messages = require('@utils/messages.utils');

module.exports = {

  createUserValidation(data) {
    const schema = joi.object().keys({
      username: joi.string().required().messages({
        'any.required': messages.user.fields.username.required,
        'string.base': messages.user.fields.username.base,
        'string.empty': messages.user.fields.username.empty,
      }),
      email: joi.string().email().required().messages({
        'any.required': messages.user.fields.email.required,
        'string.base': messages.user.fields.email.base,
        'string.email': messages.user.fields.email.format,
        'string.empty': messages.user.fields.email.empty
      }),
      /* eslint-disable prefer-regex-literals */
      password: joi.string().required().pattern(new RegExp("^[a-zA-z0-9]{8,30}$")).messages({
        'any.required': messages.user.fields.password.required,
        'string.empty': messages.user.fields.password.empty,
        'string.base': messages.user.fields.password.base,
        'string.pattern.base': messages.user.fields.password.pattern
      }),
      roles: joi.array().items(joi.number().positive()).unique().min(1).empty(' ').messages({
        'number.base': messages.user.fields.roles.base,
        'number.positive': messages.user.fields.roles.positive,
        'array.min': messages.role.fields.permissions.array_min,
        'array.base': messages.role.fields.permissions.base,
        'array.unique': messages.user.fields.roles.unique,
      }),
    }).unknown(false);
    return schema.validate(data);
  },

  updateUserValidation(data) {
    const schema = joi.object().keys({
      username: joi.string().empty(' ').messages({
        'string.base': messages.user.fields.username.base,
        'string.empty': messages.user.fields.username.empty,
      }),
      email: joi.string().email().empty(' ').messages({
        'string.email': messages.user.fields.email.format,
        'string.empty': messages.user.fields.email.empty,
      }),
    }).unknown(false);
    return schema.validate(data);
  },

  roleUserValidation(data) {
    const schema = joi.object().keys({
      userId: joi.number().positive().required().messages({
        'any.required': messages.user.fields.id.required,
        'number.base': messages.user.fields.id.base,
        'number.positive': messages.user.fields.id.positive,
      }),
      roleId: joi.number().positive().required().messages({
        'any.required': messages.role.fields.id.required,
        'number.base': messages.role.fields.id.base,
        'number.positive': messages.role.fields.id.positive,
      }),
    }).unknown(false);
    return schema.validate(data);
  }

}