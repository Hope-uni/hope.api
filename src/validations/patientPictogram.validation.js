const joi = require('joi');
const messages = require('@utils/messages.utils');


module.exports = {

  createPatientPictogram(data) {
    const schema = joi.object().keys({
      name: joi.string().required().min(3,'utf8').messages({
        'any.required': messages.pictogram.fields.name.required,
        'string.base': messages.pictogram.fields.name.base,
        'string.min': messages.pictogram.fields.name.min,
        'string.empty': messages.pictogram.fields.name.empty,
      }),
      imageUrl: joi.string().required().messages({
        'any.required': messages.pictogram.fields.image.required,
        'string.base': messages.pictogram.fields.image.base,
        'string.empty': messages.pictogram.fields.image.empty,
      }),
      patientId: joi.number().positive().required().messages({
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
      patientId: joi.number().positive().empty(' ').messages({
        'number.base': messages.patient.fields.id.base,
        'number.positive': messages.patient.fields.id.positive,
      }),
      name: joi.string().empty(' ').min(3,'utf8').messages({
        'string.base': messages.pictogram.fields.name.base,
        'string.min': messages.pictogram.fields.name.min,
        'string.empty': messages.pictogram.fields.name.empty,
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
      categoryId: joi.number().positive().empty(' ').messages({
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
  }


}