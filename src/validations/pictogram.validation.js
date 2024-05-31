const joi = require('joi');
const messages = require('@utils/messages.utils');



module.exports = {

  createPictogramValidation(data) {
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
      categoryId: joi.number().positive().required().messages({
        'any.required': messages.category.fields.id.required,
        'number.base': messages.category.fields.id.base,
        'number.positive': messages.category.fields.id.positive,
      }),
    }).unknown(false);
    return schema.validate(data);
  },

  updatePictogramValidation(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': messages.pictogram.fields.id.required,
        'number.base': messages.pictogram.fields.id.base,
        'number.positive': messages.pictogram.fields.id.positive,
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
      categoryId: joi.number().positive().empty(' ').messages({
        'number.base': messages.category.fields.id.base,
        'number.positive': messages.category.fields.id.positive,
      }),
    }).unknown(false);
    return schema.validate(data);
  },

}