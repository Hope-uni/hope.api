const joi = require('joi');


module.exports = {

  createUserValidation(data) {
    const schema = joi.object().keys({
      username: joi.string().required().messages({
        'any.required': `Nombre es requerido`,
        'string.base': `Nombre debe ser un texto válido`,
        'string.empty': `Nombre no debe estar vacío`
      }),
      email: joi.string().email().required().messages({
        'any.required': `Correo es requerido`,
        'string.email': `Correo debe ser válido`,
      }),
      /* eslint-disable prefer-regex-literals */
      password: joi.string().required().pattern(new RegExp("^[a-zA-z0-9]{8,30}$")).messages({
        'any.required': `Contraseña es requerido`,
        'string.empty': `Contraseña no debe estar vacío`,
        'string.base': `Contraseña debe ser un texto válido`,
        'string.pattern.base': `Contraseña debería tener entre 8 y 30 carácteres además contener letras y números`
      }),
      roleId: joi.number().positive().required().messages({
        'any.required': `Identificador del rol es requerido`,
        'number.base': `Identificador del rol debe ser un número válido`,
        'number.positive': `Identificador del rol debe ser un número positivo`,
      })
    });
    return schema.validate(data);
  },

  updateUserValidation(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': `Identificador es requerido`,
        'number.base': `Identificador debe ser un número válido`,
        'number.positive': `Identificador debe ser un número positivo`,
      }),
      username: joi.string().empty(' ').messages({
        'string.base': `Nombre debe ser un texto válido`,
      }),
      email: joi.string().email().empty(' ').messages({
        'string.email': `Correo debe ser válido`,
      }),
      roleId: joi.number().positive().empty(' ').messages({
        'number.base': `Identificador del rol debe ser un número válido`,
        'number.positive': `Identificador del rol debe ser un número positivo`,
      })
    });
    return schema.validate(data);
  }

}