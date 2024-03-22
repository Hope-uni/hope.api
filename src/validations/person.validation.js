const joi = require('joi');

module.exports = {

  createPersonValidation(data) {
    const schema = joi.object().keys({
      firstName: joi.string().required().min(3,'utf8').messages({
        'any.required': `Primer Nombre es requerido`,
        'string.base': `Primer Nombre debe ser un texto válido`,
        'string.empty': `Primer Nombre no debe estar vacío`,
        'string.min': `Primer Nombre debe tener como minimo 3 caracteres`
      }),
      secondName: joi.string().empty(' ').min(3,'utf8').messages({
        'string.base': `Segundo Nombre debe ser un texto válido`,
        'string.min': `Segundo Nombre debe tener como minimo 3 caracteres`
      }),
      surname: joi.string().required().min(3,'utf8').messages({
        'any.required': `Primer Apellido es requerido`,
        'string.base': `Primer Apellido debe ser un texto válido`,
        'string.empty': `Primer Apellido no debe estar vacío`,
        'string.min': `Primer Apellido debe tener como minimo 3 caracteres`
      }),
      secondSurname: joi.string().empty(' ').min(3,'utf8').messages({
        'string.base': `Segundo Apellido debe ser un texto válido`,
        'string.min': `Segundo Apellido debe tener como minimo 3 caracteres`
      }),
      imageProfile: joi.string().empty(' ').messages({
        'string.base': `Imagen de perfil debe ser un texto válido`
      }),
      address: joi.string().required().min(3,'utf8').messages({
        'any.required': `Dirección es requerida`,
        'string.base': `Dirección debe ser un texto válido`,
        'string.empty': `Dirección no debe estar vacía`,
        'string.min': `La dirección proporcionada es muy corta. Por favor, proporciona una dirección más detallada.`
      }),
    });
    return schema.validate(data);
  },

  updatePersonValidation(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': `Identificador Persona es requerido`,
        'number.base': `Identificador Persona debe ser un número válido`,
        'number.positive': `Identificador Persona debe ser un número positivo`,
      }),
      firstName: joi.string().empty(' ').min(3,'utf8').messages({
        'string.base': `Primer Nombre debe ser un texto válido`,
        'string.min': `Primer Nombre debe tener como minimo 3 caracteres`
      }),
      secondName: joi.string().empty(' ').min(3,'utf8').messages({
        'string.base': `Segundo Nombre debe ser un texto válido`,
        'string.min': `Segundo Nombre debe tener como minimo 3 caracteres`
      }),
      surname: joi.string().empty(' ').min(3,'utf8').messages({
        'string.base': `Primer Apellido debe ser un texto válido`,
        'string.min': `Primer Apellido debe tener como minimo 3 caracteres`
      }),
      secondSurname: joi.string().empty(' ').min(3,'utf8').messages({
        'string.base': `Segundo Apellido debe ser un texto válido`,
        'string.min': `Segundo Apellido debe tener como minimo 3 caracteres`
      }),
      imageProfile: joi.string().empty(' ').messages({
        'string.base': `Imagen de perfil debe ser un texto válido`
      }),
      address: joi.string().empty(' ').min(3,'utf8').messages({
        'string.base': `Dirección debe ser un texto válido`,
        'string.min': `La dirección proporcionada es muy corta. Por favor, proporciona una dirección más detallada.`
      }),
    });
    return schema.validate(data);
  },

}