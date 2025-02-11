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
      phaseId: joi.number().positive().required().messages({
        'any.required': messages.phase.fields.id.required,
        'number.base': messages.phase.fields.id.base,
        'number.positive': messages.phase.fields.id.positive,
      }),
      teaDegreeId: joi.number().positive().required().messages({
        'any.required': messages.teaDegree.fields.id.required,
        'number.base': messages.teaDegree.fields.id.base,
        'number.positive': messages.teaDegree.fields.id.positive,
      }),
      observations: joi.string().empty(' ').messages({
        'string.base': messages.patient.fields.observations.base,
      })
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
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
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

}