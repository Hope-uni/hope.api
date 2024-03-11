const joi = require('joi');

module.exports = {

  findOneValidation(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': `Identificador es requerido`,
        'number.base': `Identificador debe ser un número válido`,
        'number.positive': `Identificador debe ser un número positivo`,
      })
    });
    return schema.validate(data);
  },

}