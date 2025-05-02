const joi = require('joi');
const messages = require('@utils/messages.utils');


module.exports = {

  createCategoryValidation(data) {
    const schema = joi.object().keys({
      name: joi.string().strict().trim().min(3,'utf8').max(15, 'utf8').required().messages({
        'any.required': messages.category.fields.name.required,
        'string.base': messages.category.fields.name.base,
        'string.empty': messages.category.fields.name.empty,
        'string.min': messages.category.fields.name.characters,
        'string.max': messages.category.fields.name.characters,
        'string.trim': messages.category.fields.name.trim,
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

  updateCategoryValidation(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': messages.category.fields.id.required,
        'number.base': messages.category.fields.id.base,
        'number.positive': messages.category.fields.id.positive,
      }),
      name: joi.string().strict().trim().empty(' ').min(3,'utf8').max(15, 'utf8').messages({
        'string.base': messages.category.fields.name.base,
        'string.empty': messages.category.fields.name.empty,
        'string.min': messages.category.fields.name.characters,
        'string.max': messages.category.fields.name.characters,
        'string.trim': messages.category.fields.name.trim,
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },



}
