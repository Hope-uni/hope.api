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
      name: joi.string().empty(' ').min(3,'utf8').messages({
        'string.base': messages.phase.fields.name.base,
        'string.min': messages.phase.fields.name.min,
      }),
      description: joi.string().empty(' ').min(10,'utf8').messages({
        'string.base': messages.phase.fields.description.base,
        'string.min': messages.phase.fields.description.min,
      }),
      scoreActivities: joi.number().positive().min(1).empty(' ').messages({
        'number.base': messages.phase.fields.scoreActivities.base,
        'number.positive': messages.phase.fields.scoreActivities.positive,
        'number.max': messages.phase.fields.scoreActivities.max,
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
      newPhase:joi.number().positive().required().messages({
        'any.required': messages.phase.fields.id.required,
        'number.base': messages.phase.fields.id.base,
        'number.positive': messages.phase.fields.id.positive,
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  }

}
