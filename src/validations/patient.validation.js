const joi = require('joi');
const { messages } = require('@utils');
const { paginationFields } = require('./pagination.validation'); // Pagination fields is for add this fields to any joi model and not use the entire joi model just for pagination.


module.exports = {

  createPatientValidation(data) {
    const schema = joi.object().keys({
      tutorId: joi.number().positive().strict().required().messages({
        'any.required': messages.tutor.fields.id.required,
        'number.base': messages.tutor.fields.id.base,
        'number.positive': messages.tutor.fields.id.positive,
      }),
      therapistId: joi.number().positive().strict().empty(' ').messages({
        'number.base': messages.tutor.fields.id.base,
        'number.positive': messages.tutor.fields.id.positive,
      }),
      phaseId: joi.number().positive().strict().required().messages({
      'any.required': messages.phase.fields.id.required,
      'number.base': messages.phase.fields.id.base,
      'number.positive': messages.phase.fields.id.positive,
    }),
      teaDegreeId: joi.number().positive().strict().required().messages({
        'any.required': messages.teaDegree.fields.id.required,
        'number.base': messages.teaDegree.fields.id.base,
        'number.positive': messages.teaDegree.fields.id.positive,
      }),
      observations: joi.string().trim().min(6, 'utf8').max(255, 'utf8').empty(' ').messages({
        'string.base': messages.patient.fields.observations.base,
        'string.trim': messages.patient.fields.observations.trim,
        'string.min': messages.patient.fields.observations.characters,
        'string.max': messages.patient.fields.observations.characters,
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
      tutorId: joi.number().positive().strict().empty(' ').messages({
        'number.base': messages.tutor.fields.id.base,
        'number.positive': messages.tutor.fields.id.positive,
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

  patientFilterValidation(data) {
    const schema = joi.object().keys({
      ...paginationFields,
      hasActiveActivity: joi.boolean().empty(' ').messages({
        'boolean.base': messages.globalFilters.hasActiveActivity.base,
      }),
      activityId: joi.number().positive().empty(' ').messages({
        'number.base': messages.activity.fields.id.base,
        'number.positive': messages.activity.fields.id.positive
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

  patientAvailableForActivityValidation(data) {
    const schema = joi.object().keys({
      ...paginationFields,
      activityId: joi.number().positive().required().messages({
        'number.base': messages.activity.fields.id.base,
        'number.positive': messages.activity.fields.id.positive,
        'any.required': messages.activity.fields.id.required
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },
}
