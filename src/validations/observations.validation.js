const joi = require('joi');
const { messages } = require('../utils');


module.exports = {
  addObservationValidation(data) {
    const schema = joi.object().keys({
      patientId: joi.number().positive().strict().required().messages({
        'any.required': messages.patient.fields.id.required,
        'number.base': messages.patient.fields.id.base,
        'number.positive': messages.patient.fields.id.positive,
      }),
      description: joi.string().strict().trim().min(6, 'utf8').max(255, 'utf8').required().messages({
        'any.required': messages.observations.fields.description.required,
        'string.base': messages.observations.fields.description.base,
        'string.empty': messages.observations.fields.description.empty,
        'string.min': messages.observations.fields.description.characters,
        'string.max': messages.observations.fields.description.characters,
        'string.trim': messages.observations.fields.description.trim
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  }
}
