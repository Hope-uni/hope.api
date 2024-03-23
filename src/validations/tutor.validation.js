const joi = require('joi');

module.exports = {

  createTutorValidation(data) {
    /* eslint-disable prefer-regex-literals */
    const schema = joi.object().keys({
      identificationNumber: joi
      .string()
      .required()
      .pattern(
        new RegExp(
          '^[0-9]{3}-(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[012])([0-9]{2})-[0-9]{4}[A-Z]$'
        )
      )
      .messages({
        'any.required': 'Cédula es requerida',
        'string.pattern.base': 'Cédula debe ser válida',
      }),
      phoneNumber: joi.number().integer().required().messages({
        'any.required': 'Teléfono es requerido',
        'number.base': 'Teléfono debe tener números naturales válidos',
      }),
      telephone: joi.number().integer().empty(' ').messages({
        'number.base': 'Teléfono convencional debe tener números naturales válidos',
      }),
    });
    return schema.validate(data);
  },
  
  updateTutorValidation(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': `Identificador es requerido`,
        'number.base': `Identificador debe ser un número válido`,
        'number.positive': `Identificador debe ser un número positivo`,
      }),
      identificationNumber: joi
      .string()
      .empty(' ')
      .pattern(
        new RegExp(
          '^[0-9]{3}-(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[012])([0-9]{2})-[0-9]{4}[A-Z]$'
        )
      )
      .messages({
        'string.pattern.base': 'Cédula debe ser válida',
      }),
      phoneNumber: joi.number().integer().empty(' ').messages({
        'number.base': 'Teléfono debe tener números naturales válidos',
      }),
      telephone: joi.number().integer().empty(' ').messages({
        'number.base': 'Teléfono convencional debe tener números naturales válidos',
      }),
    });
    return schema.validate(data);
  },

}