const joi = require('joi');
const { messages } = require('@utils');

const joiObject = {
  page: joi.number().positive().empty(' ').messages({
    'number.base': messages.pagination.page.base,
    'number.positive': messages.pagination.page.positive,
  }),
  size: joi.number().positive().empty(' ').messages({
    'number.base': messages.pagination.size.base,
    'number.positive': messages.pagination.size.positive,
  }),
}

const paginationEntry = (data) => {
  const schema = joi.object().keys(joiObject).unknown(false).options({ abortEarly: false }).messages({
    'object.unknown': messages.generalMessages.unknown_object,
  });
  return schema.validate(data);
}

module.exports = {
  paginationFields: joiObject,
  paginationEntry,
}
