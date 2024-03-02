const joi = require('joi');

module.exports = {

  createRoleValidation(data) {
    const schema = joi.object().keys({
      name: joi.string().required().messages({
        'any.required': `Role name is required`,
        'string.base': `Role name must be a valid text`,
        'string.empty': `Rle name can not be empty`
      }),
      permissions: joi.array().required().min(1).messages({
        'any.required': `Role permissions are required`,
        'array.min': `Role permissions must have at least 1 permission`,
        'array.base': `Permissions must be a valid array`,
      }),
    });
    return schema.validate(data);
  },

  findRoleValidation(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': `Role id is required`,
        'number.base': `Role id must be a valid number`,
        'number.positive': `Role id must be a positive number`,
      })
    });
    return schema.validate(data);
  },

  updateRoleValidation(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': `Role id is required`,
        'number.base': `Role id must be a valid number`,
        'number.positive': `Role id must be a positive number`,
      }),
      name: joi.string().empty(' ').messages({
        'string.base': `Role name must be a valid text`,
      }),
      permissions: joi.array().empty(' ').min(1).messages({
        'array.min': `Role permissions must have at least 1 permission`,
        'array.base': `Permissions must be a valid array`,
      }),
    });
    return schema.validate(data);
  },

}