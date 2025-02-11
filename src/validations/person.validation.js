const joi = require('joi');
const messages = require('@utils/messages.utils');

module.exports = {

  createPersonValidation(data) {
    const schema = joi.object().keys({
      firstName: joi.string().required().min(3,'utf8').messages({
        'any.required': messages.person.fields.firstName.required,
        'string.base': messages.person.fields.firstName.base,
        'string.min': messages.person.fields.firstName.min,
        'string.empty': messages.person.fields.firstName.empty,
      }),
      secondName: joi.string().empty(' ').min(3,'utf8').messages({
        'string.base': messages.person.fields.secondName.base,
        'string.min': messages.person.fields.secondName.min
      }),
      surname: joi.string().required().min(3,'utf8').messages({
        'any.required': messages.person.fields.surname.required,
        'string.base': messages.person.fields.surname.base,
        'string.min': messages.person.fields.surname.min,
        'string.empty': messages.person.fields.surname.empty,
      }),
      secondSurname: joi.string().empty(' ').min(3,'utf8').messages({
        'string.base': messages.person.fields.secondSurname.base,
        'string.min': messages.person.fields.secondSurname.min
      }),
      imageProfile: joi.string().empty(' ').messages({
        'string.base': messages.person.fields.imageProfile.base
      }),
      address: joi.string().required().min(3,'utf8').messages({
        'any.required': messages.person.fields.address.required,
        'string.base': messages.person.fields.address.base,
        'string.min': messages.person.fields.address.min,
        'string.empty': messages.person.fields.address.empty,
      }),
      birthday: joi.date().iso().min('01-01-1900').required().messages({
        'any.required': messages.person.fields.birthday.required,
        'date.min': messages.person.fields.birthday.min,
        'date.format': messages.person.fields.birthday.format
      }),
      gender: joi.string().valid('Femenino','femenino','Masculino','masculino').required().messages({
        'any.required': messages.person.fields.gender.required,
        'any.only': messages.person.fields.gender.only,
        'string.base': messages.person.fields.gender.base
      })
    }).unknown(false).options({ abortEarly: false }).messages({
        'object.unknown': messages.generalMessages.unknown_object,
      });
    return schema.validate(data);
  },

  updatePersonValidation(data) {
    const schema = joi.object().keys({
      firstName: joi.string().empty(' ').min(3,'utf8').messages({
        'string.base': messages.person.fields.firstName.base,
        'string.min': messages.person.fields.firstName.min,
      }),
      secondName: joi.string().empty(' ').min(3,'utf8').messages({
        'string.base': messages.person.fields.secondSurname.base,
        'string.min': messages.person.fields.secondSurname.min
      }),
      surname: joi.string().empty(' ').min(3,'utf8').messages({
        'string.base': messages.person.fields.surname.base,
        'string.min': messages.person.fields.surname.min,
      }),
      secondSurname: joi.string().empty(' ').min(3,'utf8').messages({
        'string.base': messages.person.fields.secondSurname.base,
        'string.min': messages.person.fields.secondSurname.min
      }),
      imageProfile: joi.string().empty(' ').messages({
        'string.base': messages.person.fields.imageProfile.base
      }),
      address: joi.string().empty(' ').min(3,'utf8').messages({
        'string.base': messages.person.fields.address.base,
        'string.min': messages.person.fields.address.min,
      }),
      birthday: joi.date().iso().min('01-01-1900').empty(' ').messages({
        'date.min': messages.person.fields.birthday.min,
        'date.format': messages.person.fields.birthday.format
      }),
      gender: joi.string().valid('Femenino','femenino','Masculino','masculino').empty(' ').messages({
        'any.only': messages.person.fields.gender.only,
        'string.base': messages.person.fields.gender.base
      })
    }).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
    return schema.validate(data);
  },

}