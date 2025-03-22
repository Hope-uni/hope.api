const joi = require('joi');
const {messages} = require('@utils');


module.exports = {

  updatePhaseValidation(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': messages.phase.fields.id.required,
        'number.base': messages.phase.fields.id.base,
        'number.positive': messages.phase.fields.id.positive,
      }),
      name: joi.string().strict().trim().min(3, 'utf8').max(60, 'utf8').empty(' ').messages({
        'string.base': messages.phase.fields.name.base,
        'string.trim': messages.phase.fields.name.trim,
        'string.min': messages.phase.fields.name.characters,
        'string.max': messages.phase.fields.name.characters,
      }),
      description: joi.string().strict().trim().min(6, 'utf8').max(255, 'utf8').empty(' ').messages({
        'string.base': messages.phase.fields.description.base,
        'string.trim': messages.phase.fields.description.trim,
        'string.min': messages.phase.fields.description.characters,
        'string.max': messages.phase.fields.description.characters,
      }),
      scoreActivities: joi.number().positive().min(10).empty(' ').messages({
        'number.base': messages.phase.fields.scoreActivities.base,
        'number.positive': messages.phase.fields.scoreActivities.positive,
        'number.max': messages.phase.fields.scoreActivities.max,
        'number.min': messages.phase.fields.scoreActivities.min,
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

  phaseShiftingValidation(data) {
    const schema = joi.object().keys({
      patientId: joi.number().positive().required().messages({
        'any.required': messages.patient.fields.id.required,
        'number.base': messages.patient.fields.id.base,
        'number.positive': messages.patient.fields.id.positive,
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  }

}
