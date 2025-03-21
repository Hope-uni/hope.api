const joi = require('joi');
const messages = require('@utils/messages.utils');


module.exports = {

  createPatientPictogram(data) {
    const schema = joi.object().keys({
      name: joi.string().strict().trim().min(3,'utf8').max(60, 'utf8').required().messages({
        'any.required': messages.pictogram.fields.name.required,
        'string.base': messages.pictogram.fields.name.base,
        'string.empty': messages.pictogram.fields.name.empty,
        'string.trim': messages.pictogram.fields.name.trim,
        'string.min': messages.pictogram.fields.name.characters,
        'string.max': messages.pictogram.fields.name.characters,
      }),
      imageUrl: joi.string().required().messages({
        'any.required': messages.pictogram.fields.image.required,
        'string.base': messages.pictogram.fields.image.base,
        'string.empty': messages.pictogram.fields.image.empty,
      }),
      patientId: joi.number().positive().strict().required().messages({
        'any.required': messages.patient.fields.id.required,
        'number.base': messages.patient.fields.id.base,
        'number.positive': messages.patient.fields.id.positive,
      }),
      pictogramId: joi.number().positive().required().messages({
        'any.required': messages.therapist.fields.id.required,
        'number.base': messages.therapist.fields.id.base,
        'number.positive': messages.therapist.fields.id.positive,
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

  updatePatientPictogram(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': messages.pictogram.fields.id.required,
        'number.base': messages.pictogram.fields.id.base,
        'number.positive': messages.pictogram.fields.id.positive,
      }),
      patientId: joi.number().positive().strict().required().messages({
        'any.required': messages.patient.fields.id.required,
        'number.base': messages.patient.fields.id.base,
        'number.positive': messages.patient.fields.id.positive,
      }),
      name: joi.string().strict().trim().min(3,'utf8').max(60, 'utf8').empty(' ').messages({
        'string.base': messages.pictogram.fields.name.base,
        'string.empty': messages.pictogram.fields.name.empty,
        'string.trim': messages.pictogram.fields.name.trim,
        'string.min': messages.pictogram.fields.name.characters,
        'string.max': messages.pictogram.fields.name.characters,
      }),
      imageUrl: joi.string().empty(' ').messages({
        'string.base': messages.pictogram.fields.image.base,
        'string.empty': messages.pictogram.fields.image.empty,
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

  patientPictogramsFilterValidation(data) {
    const schema = joi.object().keys({
      patientId: joi.number().positive().empty(' ').messages({
        'number.base': messages.patient.fields.id.base,
        'number.positive': messages.patient.fields.id.positive,
      }),
      categoryId: joi.number().positive().strict().empty(' ').messages({
        'number.base': messages.category.fields.id.base,
        'number.positive': messages.category.fields.id.positive,
      }),
      pictogramName: joi.string().empty(' ').messages({
        'string.base': messages.pictogram.fields.name.base,
        'string.empty': messages.pictogram.fields.name.empty,
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

  deletePatientPictograms(data) {
    const schema = joi.object().keys({
      patientId: joi.number().positive().strict().required().messages({
        'number.base': messages.patient.fields.id.base,
        'number.positive': messages.patient.fields.id.positive,
        'any.required': messages.patient.fields.id.required,
      }),
    });
    return schema.validate(data);
  }


}
