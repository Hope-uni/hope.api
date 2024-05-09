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
      birthday: joi.date().iso().min('01-01-1900').required().messages({
        'any.required': 'Fecha de Nacimiento es requerida',
        'date.min': 'Fecha de nacimiento indica una edad que sobrepasa el estandar de longevidad a nivel mundial.',
        'date.format': 'Fecha de Nacimiento debe tener un formato de (Año-Mes-Dia)'
      }),
      gender: joi.string().valid('Femenino','femenino','Masculino','masculino').required().messages({
        'any.required': 'Sexo debe ser especificado',
        'any.only': 'Sexo debe ser (Femenino | femenino) ó (Masculino | masculino)',
        'string.base': 'Sexo debe ser un texto valido '
      })
    }).unknown(false);
    return schema.validate(data);
  },

  updatePersonValidation(data) {
    const schema = joi.object().keys({
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
      birthday: joi.date().iso().min('01-01-1900').empty(' ').messages({
        'date.min': 'Fecha de nacimiento indica una edad que sobrepasa el estandar de longevidad a nivel mundial.',
        'date.format': 'Fecha de Nacimiento debe tener un formato de (Año-Mes-Dia)'
      }),
      gender: joi.string().valid('Femenino','femenino','Masculino','masculino').empty(' ').messages({
        'any.only': 'Sexo debe ser (Femenino | femenino) ó (Masculino | masculino)',
        'string.base': 'Sexo debe ser un texto valido '
      })
    }).unknown(false);
    return schema.validate(data);
  },

}