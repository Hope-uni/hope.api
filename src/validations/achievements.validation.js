const joi = require('joi');
const { messages } = require('../utils');
const {paginationFields } = require('./pagination.validation');


module.exports = {

  createAchievementsValidation(data) {
    const schema = joi.object().keys({
      name: joi.string().strict().trim().required().min(3, 'utf8').max(20, 'utf8').messages({
        'any.required': messages.achievements.fields.name.required,
        'string.base': messages.achievements.fields.name.base,
        'string.empty': messages.achievements.fields.name.empty,
        'string.trim': messages.achievements.fields.name.trim,
        'string.min': messages.achievements.fields.name.characters,
        'string.max': messages.achievements.fields.name.characters,
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

  updateAchievementsValidation(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': messages.achievements.fields.id.required,
        'number.base': messages.achievements.fields.id.base,
        'number.positive': messages.achievements.fields.id.positive,
      }),
      name: joi.string().strict().trim().empty(' ').min(3, 'utf8').max(20, 'utf8').messages({
        'string.base': messages.achievements.fields.name.base,
        'string.empty': messages.achievements.fields.name.empty,
        'string.trim': messages.achievements.fields.name.trim,
        'string.min': messages.achievements.fields.name.characters,
        'string.max': messages.achievements.fields.name.characters,
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

  patientAchievementValidation(data) {
    const schema = joi.object().keys({
      patientId: joi.number().positive().strict().required().messages({
        'any.required': messages.patient.fields.id.required,
        'number.base': messages.patient.fields.id.base,
        'number.positive': messages.patient.fields.id.positive,
      }),
      achievementId: joi.number().positive().strict().required().messages({
        'any.required': messages.achievements.fields.id.required,
        'number.base': messages.achievements.fields.id.base,
        'number.positive': messages.achievements.fields.id.positive,
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

  filtersValidation(data) {
    const schema = joi.object().keys({
      ...paginationFields,
      name: joi.string().strict().trim().empty(' ').messages({
        'string.base': messages.achievements.fields.name.base,
        'string.empty': messages.achievements.fields.name.empty,
        'string.trim': messages.achievements.fields.name.trim,
      }),
      patientId: joi.number().positive().empty(' ').messages({
        'number.base': messages.patient.fields.id.base,
        'number.positive': messages.patient.fields.id.positive,
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  }

}
