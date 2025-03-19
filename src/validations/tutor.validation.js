const joi = require('joi');
const messages = require('@utils/messages.utils');

module.exports = {

  createTutorValidation(data) {
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
        'any.required': messages.tutor.fields.identificationNumber.required,
        'string.pattern.base': messages.tutor.fields.identificationNumber.pattern,
      }),
      phoneNumber: joi.string().required().pattern(
        new RegExp('^(5|7|8)[0-9]{7}$')
      ).messages({
        'any.required': messages.tutor.fields.phoneNumber.required,
        'string.pattern.base': messages.tutor.fields.phoneNumber.pattern,
        'string.base': messages.tutor.fields.phoneNumber.base
      }),
      telephone: joi.string().pattern(
        new RegExp('^(2)[0-9]{7}$')
      ).messages({
        'string.pattern.base': messages.tutor.fields.phoneNumber.pattern,
        'string.base': messages.tutor.fields.phoneNumber.base
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

  updateTutorValidation(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': messages.tutor.fields.id.required,
        'number.base': messages.tutor.fields.id.base,
        'number.positive': messages.tutor.fields.id.positive,
      }),
      identificationNumber: joi
      .string()
      .empty(' ')
      .pattern(
        new RegExp(
          '^[0-9]{3}-(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[012])([0-9]{2})-[0-9]{4}[A-Z]$'
        )
      )
      .messages({
        'string.pattern.base': messages.tutor.fields.identificationNumber.pattern,
      }),
      phoneNumber: joi.string().pattern(
        new RegExp('^(5|7|8)[0-9]{7}$')
      ).messages({
        'string.pattern.base': messages.tutor.fields.phoneNumber.pattern,
        'string.base': messages.tutor.fields.phoneNumber.base
      }),
      telephone: joi.string().pattern(
        new RegExp('^(2)[0-9]{7}$')
      ).messages({
        'string.pattern.base': messages.tutor.fields.phoneNumber.pattern,
        'string.base': messages.tutor.fields.phoneNumber.base
      }),
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

}
