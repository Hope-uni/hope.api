const joi = require('joi');
const { messages } = require('../utils');


module.exports = {
  addObservationValidation(data) {
    const schema = joi.object().keys({
      patientId: joi.number().positive().required().messages({
        'any.required': messages.patient.fields.id.required,
        'number.base': messages.patient.fields.id.base,
        'number.positive': messages.patient.fields.id.positive,
      }),
      description: joi.string().min(6).max(255).required().messages({
        'any.required': messages.observations.fields.description.required,
        'string.base': messages.observations.fields.description.base,
        'string.empty': messages.observations.fields.description.empty,
        'string.min': messages.observations.fields.description.min,
        'string.max': messages.observations.fields.description.max,
      }),
    });
    return schema.validate(data);
  }
}
