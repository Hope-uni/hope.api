const joi = require('joi');

module.exports = {

  createRoleValidation(data) {
    const schema = joi.object().keys({
      name: joi.string().required().messages({
        'any.required': `Nombre es requerido`,
        'string.base': `Nombre debe ser un texto válido`,
        'string.empty': `Nombre no debe estar vacío`
      }),
      permissions: joi.array().required().min(1).messages({
        'any.required': `Permisos son requeridos.`,
        'array.min': `Debe ingresar al menos un permiso.`,
        'array.base': `Permisos deben ser enviados en formato válido.`,
      }),
    });
    return schema.validate(data);
  },

  findRoleValidation(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': `Identificador es requerido`,
        'number.base': `Identificador debe ser un número válido`,
        'number.positive': `Identificador debe ser un número positivo`,
      })
    });
    return schema.validate(data);
  },

  updateRoleValidation(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': `Identificador es requerido`,
        'number.base': `Identificador debe ser un número válido`,
        'number.positive': `Identificador debe ser un número positivo`,
      }),
      name: joi.string().empty(' ').messages({
        'string.base': `Nombre debe ser un texto válido`,
      }),
      permissions: joi.array().empty(' ').min(1).messages({
        'array.min': `Debe ingresar al menos un permiso.`,
        'array.base': `Permisos deben ser enviados en formato válido.`,
      }),
    });
    return schema.validate(data);
  },

}