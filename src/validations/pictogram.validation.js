const joi = require('joi');
const messages = require('@utils/messages.utils');



module.exports = {

  createPictogramValidation(data) {
    const schema = joi.object().keys({
      name: joi.string().strict().trim().min(3,'utf8').max(60, 'utf8').required().messages({
        'any.required': messages.pictogram.fields.name.required,
        'string.base': messages.pictogram.fields.name.base,
        'string.empty': messages.pictogram.fields.name.empty,
        'string.trim': messages.pictogram.fields.name.trim,
        'string.min': messages.pictogram.fields.name.characters,
        'string.max': messages.pictogram.fields.name.characters,
      }),
      categoryId: joi.number().positive().required().messages({
        'any.required': messages.category.fields.id.required,
        'number.base': messages.category.fields.id.base,
        'number.positive': messages.category.fields.id.positive,
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

  updatePictogramValidation(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': messages.pictogram.fields.id.required,
        'number.base': messages.pictogram.fields.id.base,
        'number.positive': messages.pictogram.fields.id.positive,
      }),
      name: joi.string().strict().trim().min(3,'utf8').max(60, 'utf8').empty(' ').messages({
        'string.base': messages.pictogram.fields.name.base,
        'string.empty': messages.pictogram.fields.name.empty,
        'string.trim': messages.pictogram.fields.name.trim,
        'string.min': messages.pictogram.fields.name.characters,
        'string.max': messages.pictogram.fields.name.characters,
      }),
      categoryId: joi.number().positive().empty(' ').messages({
        'number.base': messages.category.fields.id.base,
        'number.positive': messages.category.fields.id.positive,
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

}
