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
      phoneNumber: joi.string().required().pattern(
        new RegExp('^(5|7|8)[0-9]{7}$')
      ).messages({
        'any.required': messages.tutor.fields.phoneNumber.required,
        'string.base': messages.therapist.fields.phoneNumber.base,
        'string.pattern.base': messages.tutor.fields.phoneNumber.pattern,
      }),
    }).unknown(false).options({ abortEarly: false });
    return schema.validate(data);
  },
  
  updateTherapistValidation(data) {
    const schema = joi.object().keys({
      id: joi.number().positive().required().messages({
        'any.required': messages.therapist.fields.id.required,
        'number.base': messages.therapist.fields.id.base,
        'number.positive': messages.therapist.fields.id.positive,
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
        'string.pattern.base': messages.therapist.fields.identificationNumber.pattern,
      }),
      phoneNumber: joi.string().pattern(
        new RegExp('^(5|7|8)[0-9]{7}$')
      ).messages({
        'string.base': messages.therapist.fields.phoneNumber.base,
        'string.pattern.base': messages.tutor.fields.phoneNumber.pattern
      }),
    }).unknown(false);
    return schema.validate(data);
  },

  assignPatientValidation(data) {
    const schema = joi.object().keys({
      therapistId: joi.number().positive().required().messages({
        'any.required': messages.therapist.fields.id.required,
        'number.base': messages.therapist.fields.id.base,
        'number.positive': messages.therapist.fields.id.positive,
      }),
      patients: joi.array().items(joi.number().positive()).unique().min(1).messages({
        'number.base': messages.therapist.fields.patients.base,
        'number.positive': messages.therapist.fields.patients.positive,
        'any.required': messages.therapist.fields.patients.required,
        'array.unique': messages.therapist.fields.patients.unique,
        'array.min': messages.therapist.fields.patients.array_min,
        'array.base': messages.therapist.fields.patients.array,
      }),
    }).unknown(false);
    return schema.validate(data);
  }

}