const joi = require('joi');

module.exports = {

  createTherapistValidation(data) {
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
    });
    return schema.validate(data);
  },
  
  updateTherapistValidation(data) {
    const schema = joi.object().keys({
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
    });
    return schema.validate(data);
  },

}