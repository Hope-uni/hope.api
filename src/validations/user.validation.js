const joi = require('joi');
const messages = require('@utils/messages.utils');

module.exports = {

  createUserValidation(data) {
    const schema = joi.object().keys({
      username: joi.string().required().min(6).max(16).messages({
        'any.required': messages.user.fields.username.required,
        'string.base': messages.user.fields.username.base,
        'string.empty': messages.user.fields.username.empty,
        'string.min': messages.user.fields.username.min,
        'string.max': messages.user.fields.username.max,
      }),
      email: joi.string().email().required().messages({
        'any.required': messages.user.fields.email.required,
        'string.base': messages.user.fields.email.base,
        'string.email': messages.user.fields.email.format,
        'string.empty': messages.user.fields.email.empty
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
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
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
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
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  }

}