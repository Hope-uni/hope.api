const joi = require('joi');



module.exports = {

  createPatientValidation(data) {
    const schema = joi.object().keys({
      age: joi.number().integer().min(1).positive().required().messages({
        'any.required': 'Edad es requerida',
        'number.min': 'Edad debe ser minimo de 1 año',
        'number.positive': 'Edad no debe ser menor a 1 año'
      }),
      idTutor: joi.number().positive().required().messages({
        'any.required': `Identificador del Tutor es requerido`,
        'number.base': `Identificador del Tutor debe ser un número válido`,
        'number.positive': `Identificador del Tutor debe ser un número positivo`,
      }),
    });
    return schema.validate(data);
  },

  updatePatientValidation(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': `Identificador es requerido`,
        'number.base': `Identificador debe ser un número válido`,
        'number.positive': `Identificador debe ser un número positivo`,
      }),
      age: joi.number().integer().min(1).positive().empty(' ').messages({
        'number.min': 'Edad debe ser minimo de 1 año',
        'number.positive': 'Edad no debe ser menor a 1 año'
      }),
      idTutor: joi.number().positive().empty(' ').messages({
        'number.base': `Identificador del Tutor debe ser un número válido`,
        'number.positive': `Identificador del Tutor debe ser un número positivo`,
      }),
    });
    return schema.validate(data);
  },

}