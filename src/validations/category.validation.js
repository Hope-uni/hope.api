const joi = require('joi');
const messages = require('@utils/messages.utils');


module.exports = {

  createCategoryValidation(data) {
    const schema = joi.object().keys({
      name: joi.string().required().min(3,'utf8').messages({
        'any.required': messages.category.fields.name.required,
        'string.base': messages.category.fields.name.base,
        'string.min': messages.category.fields.name.min,
        'string.empty': messages.category.fields.name.empty
      }),
      icon: joi.string().required().messages({
        'any.required': messages.category.fields.icon.required,
        'string.base': messages.category.fields.icon.base,
        'string.empty': messages.category.fields.icon.empty,
      })
    }).unknown(false);
    return schema.validate(data);
  },

  updateCategoryValidation(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': messages.category.fields.id.required,
        'number.base': messages.category.fields.id.base,
        'number.positive': messages.category.fields.id.positive,
      }),
      name: joi.string().empty(' ').min(3,'utf8').messages({
        'string.base': messages.category.fields.name.base,
        'string.min': messages.category.fields.name.min,
        'string.empty': messages.category.fields.name.empty
      }),
      icon: joi.string().empty(' ').messages({
        'string.base': messages.category.fields.icon.base,
        'string.empty': messages.category.fields.icon.empty,
      })
    }).unknown(false);
    return schema.validate(data);
  },



}