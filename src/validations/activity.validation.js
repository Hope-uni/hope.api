const joi = require('joi');
const {messages} = require('@utils/index');

module.exports = {

  createActivityValidation(data) {
    const schema = joi.object().keys({
      name: joi.string().required().min(3).max(30).messages({
        'any.required': messages.activity.fields.name.required,
        'string.base': messages.activity.fields.name.base,
        'string.min': messages.activity.fields.name.min,
        'string.max': messages.activity.fields.name.max,
      }),
      description: joi.string().min(6).max(255).required().messages({
        'any.required': messages.activity.fields.description.required,
        'string.base': messages.activity.fields.description.base,
        'string.min': messages.activity.fields.description.min,
        'string.max': messages.activity.fields.description.max,
      }),
      satisfactoryPoints: joi.number().max(20).required().positive().messages({
        'any.required': messages.activity.fields.satisfactoryPoints.required,
        'number.base': messages.activity.fields.satisfactoryPoints.base,
        'number.positive': messages.activity.fields.satisfactoryPoints.positive,
        'number.max': messages.activity.fields.satisfactoryPoints.max,	
      }),
      pictogramSentence: joi.array().items(joi.number().positive()).unique().min(1).messages({
        'number.base': messages.activity.fields.pictogramSentence.base,
        'number.positive': messages.activity.fields.pictogramSentence.positive,
        'array.base': messages.activity.fields.pictogramSentence.base,
        'array.min': messages.activity.fields.pictogramSentence.array_min,
        'array.unique': messages.activity.fields.pictogramSentence.unique,
      }),
      phaseId: joi.number().required().positive().messages({
        'any.required': messages.phase.fields.id.required,
        'number.base': messages.phase.fields.id.base,
        'number.positive': messages.phase.fields.id.positive,
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

  updateActivityValidation(data) {
    const schema = joi.object().keys({
      name: joi.string().empty(' ').messages({
        'string.base': messages.activity.fields.name.base,
        'string.empty': messages.activity.fields.name.empty,
      }),
      description: joi.string().empty(' ').messages({
        'string.base': messages.activity.fields.description.base,
        'string.empty': messages.activity.fields.description.empty,
      }),
      satisfactoryPoints: joi.number().positive().messages({
        'number.base': messages.activity.fields.satisfactoryPoints.base,
        'number.positive': messages.activity.fields.satisfactoryPoints.positive,
      }),
      pictogramSentence: joi.string().empty(' ').messages({
        'string.base': messages.activity.fields.pictogramSentence.base,
        'string.empty': messages.activity.fields.pictogramSentence.empty,
      }),
      phaseId: joi.number().positive().empty('  ').messages({
        'number.base': messages.activity.fields.phaseId.base,
        'number.positive': messages.activity.fields.phaseId.positive,
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },


  assignActivityPatient(data) {
    const schema = joi.object().keys({
      activityId: joi.number().positive().required().messages({
        'any.required': messages.activity.fields.id.required,
        'number.base': messages.activity.fields.id.base,
        'number.positive': messages.activity.fields.id.positive,
      }),
      patientId: joi.number().positive().required().messages({
        'any.required': messages.patient.fields.id.required,
        'number.base': messages.patient.fields.id.base,
        'number.positive': messages.patient.fields.id.positive,
      }),
      satisfactoryAttempts: joi.number().positive().required().messages({
        'any.required': messages.activity.fields.satisfactorAttempts.required,
        'number.base': messages.activity.fields.satisfactorAttempts.base,
        'number.positive': messages.activity.fields.satisfactorAttempts.positive,
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  }

} 