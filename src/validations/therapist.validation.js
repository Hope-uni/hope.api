const joi = require('joi');
const { messages } = require('@utils/index');

module.exports = {

  createTherapistValidation(data) {
    /* eslint-disable prefer-regex-literals */
    const schema = joi.object().keys({
      identificationNumber: joi
      .string()
      .required()
      .pattern(
        new RegExp(
          '^[0-9]{3}-(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[012])([0-9]{2})-[0-9]{4}[A-Z]$'
        )
      )
      .messages({
        'any.required': messages.therapist.fields.identificationNumber.required,
        'string.pattern.base': messages.therapist.fields.identificationNumber.pattern,
      }),
      phoneNumber: joi.number().integer().required().messages({
        'any.required': messages.therapist.fields.phoneNumber.required,
        'number.base': messages.therapist.fields.phoneNumber.base,
      }),
    }).unknown(false);
    return schema.validate(data);
  },
  
  updateTherapistValidation(data) {
    const schema = joi.object().keys({
      identificationNumber: joi
      .string()
      .empty(' ')
      .pattern(
        new RegExp(
          '^[0-9]{3}-(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[012])([0-9]{2})-[0-9]{4}[A-Z]$'
        )
      )
      .messages({
        'string.pattern.base': messages.therapist.fields.identificationNumber.pattern,
      }),
      phoneNumber: joi.number().integer().empty(' ').messages({
        'number.base': messages.therapist.fields.phoneNumber.base,
      }),
    }).unknown(false);
    return schema.validate(data);
  },

}