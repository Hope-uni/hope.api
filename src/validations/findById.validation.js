const joi = require('joi');
const messages = require('@utils/messages.utils');

module.exports = {

  findOneValidation(data, message) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': message.required,
        'number.base': message.base,
        'number.positive': message.positive,
      })
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

}
