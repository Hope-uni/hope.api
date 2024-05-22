const joi = require('joi');
const { messages } = require('@utils/index');


module.exports = {

  createPatientValidation(data) {
    const schema = joi.object().keys({
      tutorId: joi.number().positive().required().messages({
        'any.required': messages.tutor.fields.id.required,
        'number.base': messages.tutor.fields.id.base,
        'number.positive': messages.tutor.fields.id.positive,
      }),
      therapistId: joi.number().positive().empty(' ').messages({
        'number.base': messages.tutor.fields.id.base,
        'number.positive': messages.tutor.fields.id.positive,
      }),
    }).unknown(false);
    return schema.validate(data);
  },

  updatePatientValidation(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': messages.patient.fields.id.required,
        'number.base': messages.patient.fields.id.base,
        'number.positive': messages.patient.fields.id.positive,
      }),
      tutorId: joi.number().positive().empty(' ').messages({
        'number.base': messages.tutor.fields.id.base,
        'number.positive': messages.tutor.fields.id.positive,
      }),
      therapistId: joi.number().positive().empty(' ').messages({
        'number.base': messages.tutor.fields.id.base,
        'number.positive': messages.tutor.fields.id.positive,
      }),
    }).unknown(false);
    return schema.validate(data);
  },

}