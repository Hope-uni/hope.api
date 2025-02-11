const joi = require('joi');
const messages = require('@utils/messages.utils');

module.exports = {

  findOneValidation(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': `Identificador es requerido`,
        'number.base': `Identificador debe ser un número válido`,
        'number.positive': `Identificador debe ser un número positivo`,
      })
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

}