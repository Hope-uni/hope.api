const joi = require('joi');
const { messages } = require('@utils/index');

module.exports = {

  loginValidation(data) {
    const schema = joi.object().keys({
      username: joi.string().empty(' ').messages({
        'string.base': messages.auth.fields.username.base,
        'string.empty': messages.auth.fields.username.empty,
      }),
      email: joi.string().email().empty(' ').messages({
        'string.email': messages.auth.fields.email.format
      }),
      password: joi.string().required().messages({
        'any.required': messages.auth.fields.password.required,
        'string.base': messages.auth.fields.password.base,
        'string.empty': messages.auth.fields.password.empty
      })
    }).unknown(false);
    return schema.validate(data);
  },


  forgotPasswordValidation(data) {
    const schema = joi.object().keys({
      email: joi.string().email().empty(' ').messages({
        'string.email': messages.auth.fields.email.format
      }),
      username: joi.string().empty(' ').messages({
        'string.base': messages.auth.fields.username.base,
        'string.empty': messages.auth.fields.username.empty,
      }),
    }).unknown(false);
    return schema.validate(data);
  },

  /* eslint-disable prefer-regex-literals */
  resetPasswordValidation(data) {
    const schema = joi.object().keys({
      password: joi.string().required().pattern(new RegExp("^[a-zA-z0-9]{8,30}$")).messages({
        'any.required': messages.auth.fields.password.required,
        'string.base': messages.auth.fields.password.base,
        'string.empty': messages.auth.fields.password.empty,
        'string.pattern.base': messages.auth.fields.password.pattern
      }),
      confirmPassword: joi
        .any()
        .valid(joi.ref('password'))
        .required()
        .messages({
          'any.only': messages.auth.fields.password.not_match,
          'any.required': messages.auth.fields.confirmPassword.required,
        })
    }).unknown(false);
    return schema.validate(data);
  },

  changePasswordValidation(data) {
    const schema = joi.object().keys({
      password: joi.string().required().pattern(new RegExp("^[a-zA-z0-9]{8,30}$")).messages({
        'any.required': messages.auth.fields.password.required,
        'string.base': messages.auth.fields.password.base,
        'string.empty': messages.auth.fields.password.empty,
        'string.pattern.base': messages.auth.fields.password.pattern
      }),
      newPassword: joi.string().required().pattern(new RegExp("^[a-zA-z0-9]{8,30}$")).messages({
        'any.required': messages.auth.fields.newPassword.required,
        'string.base': messages.auth.fields.newPassword.base,
        'string.empty': messages.auth.fields.newPassword.empty,
        'string.pattern.base': messages.auth.fields.newPassword.pattern,
      }),
      confirmNewPassword: joi
        .any()
        .valid(joi.ref('newPassword'))
        .required()
        .messages({
          'any.only': messages.auth.fields.password.not_match,
          'any.required': messages.auth.fields.confirmPassword.required,
        })
    }).unknown(false);
    return schema.validate(data);
  }

}