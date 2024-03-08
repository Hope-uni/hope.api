const joi = require('joi');


module.exports = {

  loginValidation(data) {
    const schema = joi.object().keys({
      username: joi.string().required().messages({
        'any.required': `Nombre de usuario es requerido`,
        'string.base': `Nombre de usuario debe ser un texto válido`,
        'string.empty': `Nombre de usuario no debe estar vacío`
      }),
      password: joi.string().required().messages({
        'any.required': `Contraseña es requerida`,
        'string.base': `Contraseña debe ser un texto válido`,
        'string.empty': `Contraseña no debe estar vacía`
      })
    });
    return schema.validate(data);
  },


  forgotPasswordValidation(data) {
    const schema = joi.object().keys({
      email: joi.email().string().required().messages({
        'any.required': `Correo es requerido`,
        'string.email': `Correo debe ser válido`,
      }),
    });
    return schema.validate(data);
  },

  /* eslint-disable prefer-regex-literals */
  resetPasswordValidation(data) {
    const schema = joi.object().keys({
      password: joi.string().required().pattern(new RegExp("^[a-zA-z0-9]{8,30}$")).messages({
        'any.required': `Contraseña es requerida`,
        'string.base': `Contraseña debe ser un texto válido`,
        'string.empty': `Contraseña no debe estar vacía`,
        'string.pattern.base': `Contraseña debería tener entre 8 y 30 carácteres además de contener letras y números`
      }),
      confirmPassword: joi
        .string()
        .valid(joi.ref('password'))
        .required()
        .pattern(new RegExp("^[a-zA-z0-9]{8,30}$"))
        .messages({
          'any.required': `Confirmar contraseña es requerida`,
          'string.base': `Confirmar contraseña debe ser un texto válido`,
          'string.empty': `Confirmar contraseña no debe estar vacía`,
          'string.pattern.base': `Confirmar contraseña debería tener entre 8 y 30 carácteres además de contener letras y números`
        })
    });
    return schema.validate(data);
  }

}