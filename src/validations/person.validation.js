const joi = require('joi');
const messages = require('@utils/messages.utils');

const createPersonObjectFields = {
  firstName: joi.string().strict().trim().required().min(3, 'utf8').max(15, 'utf8').messages({
    'any.required': messages.person.fields.firstName.required,
    'string.base': messages.person.fields.firstName.base,
    'string.empty': messages.person.fields.firstName.empty,
    'string.trim': messages.person.fields.firstName.trim,
    'string.min': messages.person.fields.firstName.characters,
    'string.max': messages.person.fields.firstName.characters,
  }),
  secondName: joi.string().strict().trim().empty(' ').allow('').min(3, 'utf8').max(15, 'utf8').messages({
    'string.base': messages.person.fields.secondName.base,
    'string.trim': messages.person.fields.secondName.trim,
    'string.min': messages.person.fields.secondName.characters,
    'string.max': messages.person.fields.secondName.characters,
  }),
  surname: joi.string().required().strict().trim().min(3, 'utf8').max(15, 'utf8').messages({
    'any.required': messages.person.fields.surname.required,
    'string.base': messages.person.fields.surname.base,
    'string.empty': messages.person.fields.surname.empty,
    'string.trim': messages.person.fields.surname.trim,
    'string.min': messages.person.fields.surname.characters,
    'string.max': messages.person.fields.surname.characters,
  }),
  secondSurname: joi.string().strict().trim().empty(' ').allow('').min(3, 'utf8').max(15, 'utf8').messages({
    'string.base': messages.person.fields.secondSurname.base,
    'string.trim': messages.person.fields.secondSurname.trim,
    'string.min': messages.person.fields.secondSurname.characters,
    'string.max': messages.person.fields.secondSurname.characters,
  }),
  address: joi.string().strict().trim().required().min(6, 'utf8').max(255, 'utf8').messages({
    'any.required': messages.person.fields.address.required,
    'string.base': messages.person.fields.address.base,
    'string.empty': messages.person.fields.address.empty,
    'string.trim': messages.person.fields.address.trim,
    'string.min': messages.person.fields.address.characters,
    'string.max': messages.person.fields.address.characters,
  }),
  birthday: joi.date().iso().min('01-01-1900').required().messages({
    'any.required': messages.person.fields.birthday.required,
    'date.min': messages.person.fields.birthday.min,
    'date.format': messages.person.fields.birthday.format
  }),
  gender: joi.string().valid('Femenino', 'femenino', 'Masculino', 'masculino').required().messages({
    'any.required': messages.person.fields.gender.required,
    'any.only': messages.person.fields.gender.only,
    'string.base': messages.person.fields.gender.base
  })
};

const updatePersonObjectFields = {
  firstName: joi.string().strict().trim().empty(' ').min(3, 'utf8').max(15, 'utf8').messages({
    'string.base': messages.person.fields.firstName.base,
    'string.empty': messages.person.fields.firstName.empty,
    'string.trim': messages.person.fields.firstName.trim,
    'string.min': messages.person.fields.firstName.characters,
    'string.max': messages.person.fields.firstName.characters,
  }),
  secondName: joi.string().strict().trim().empty(' ').allow('').min(3, 'utf8').max(15, 'utf8').messages({
    'string.base': messages.person.fields.secondSurname.base,
    'string.trim': messages.person.fields.secondName.trim,
    'string.min': messages.person.fields.secondName.characters,
    'string.max': messages.person.fields.secondName.characters,
  }),
  surname: joi.string().strict().trim().empty(' ').min(3, 'utf8').max(15, 'utf8').messages({
    'string.base': messages.person.fields.surname.base,
    'string.empty': messages.person.fields.surname.empty,
    'string.trim': messages.person.fields.surname.trim,
    'string.min': messages.person.fields.surname.characters,
    'string.max': messages.person.fields.surname.characters,
  }),
  secondSurname: joi.string().strict().trim().empty(' ').allow('').min(3, 'utf8').max(15, 'utf8').messages({
    'string.base': messages.person.fields.secondSurname.base,
    'string.trim': messages.person.fields.secondSurname.trim,
    'string.min': messages.person.fields.secondSurname.characters,
    'string.max': messages.person.fields.secondSurname.characters,
  }),
  address: joi.string().strict().trim().empty(' ').min(6, 'utf8').max(255, 'utf8').messages({
    'string.base': messages.person.fields.address.base,
    'string.empty': messages.person.fields.address.empty,
    'string.trim': messages.person.fields.address.trim,
    'string.min': messages.person.fields.address.characters,
    'string.max': messages.person.fields.address.characters,
  }),
  birthday: joi.date().iso().min('01-01-1900').empty(' ').messages({
    'date.min': messages.person.fields.birthday.min,
    'date.format': messages.person.fields.birthday.format
  }),
  gender: joi.string().valid('Femenino', 'femenino', 'Masculino', 'masculino').empty(' ').messages({
    'any.only': messages.person.fields.gender.only,
    'string.base': messages.person.fields.gender.base,
    'string.empty': messages.person.fields.gender.empty,
  })
};

const createPersonValidation = (data) => {
  const schema = joi.object().keys(createPersonObjectFields).unknown(false).options({ abortEarly: false }).messages({
      'object.unknown': messages.generalMessages.unknown_object,
    });
  return schema.validate(data);
}

const updatePersonValidation = (data) => {
  const schema = joi.object().keys(updatePersonObjectFields).unknown(false).options({ abortEarly: false }).messages({
    'object.unknown': messages.generalMessages.unknown_object,
  });
  return schema.validate(data);
}

module.exports = {
  createPersonValidation,
  updatePersonValidation,
  createPersonObjectFields,
  updatePersonObjectFields
}
