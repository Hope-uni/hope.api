const joi = require('joi');
const { messages } = require('@utils/index');

module.exports = {

  createRoleValidation(data) {
    const schema = joi.object().keys({
      name: joi.string().required().messages({
        'any.required': messages.role.fields.name.required,
        'string.base': messages.role.fields.name.base,
        'string.empty': messages.role.fields.name.empty
      }),
      permissions: joi.array().items(joi.number().positive()).required().min(1).messages({
        'any.required': messages.role.fields.permissions.required,
        'array.min': messages.role.fields.permissions.array_min,
        'array.base': messages.role.fields.permissions.base,
        'number.base': messages.role.fields.permissions.number,
        'number.positive': messages.role.fields.permissions.positive,
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

  findRoleValidation(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': messages.role.fields.id.required,
        'number.base': messages.role.fields.id.base,
        'number.positive': messages.role.fields.id.positive,
      })
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

  updateRoleValidation(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': messages.role.fields.id.required,
        'number.base': messages.role.fields.id.base,
        'number.positive': messages.role.fields.id.positive,
      }),
      name: joi.string().empty(' ').messages({
        'string.base': messages.role.fields.name.base,
      }),
      permissions: joi.array().items(joi.number().positive()).empty(' ').min(1).messages({
        'array.min': messages.role.fields.permissions.array_min,
        'array.base': messages.role.fields.permissions.base,
        'number.base': messages.role.fields.permissions.number,
        'number.positive': messages.role.fields.permissions.positive,
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

}