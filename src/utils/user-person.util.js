const logger = require('@config/logger.config');
const { Person } = require('@models/index.js');
const { 
  createUser,
  updateUser
} = require('@services/user.service');
const { formatErrorMessages } = require('./formatErrorMessages.util');
const messages = require('./messages.utils');


module.exports = {

  async createUserPerson(body, transaction) {
    try {
      
      // destructuring Object
      const {
        username,
        password,
        email,
        roles,
        firstName,
        secondName,
        surname,
        secondSurname,
        imageProfile,
        birthday,
        gender,
        address
      } = body;

      // User creation
      const { error:dataError, statusCode, message, validationErrors, data:userData } = await createUser({
        username,
        password,
        email,
        roles
      }, transaction);
      if(dataError) {
        return {
          error: dataError,
          statusCode,
          message,
          validationErrors,
        }
      };

      // Person creation
      const personData = await Person.create({
        firstName,
        secondName,
        surname,
        secondSurname,
        imageProfile,
        address,
        birthday,
        gender
      },{transaction});
      if(!personData) {
        logger.error(messages.person.errors.service.create);
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('create', messages.therapist.errors.service.create),
        };
      };

      return {
        data: {
          userId: userData.id,
          personId: personData.id
        }
      }

    } catch (error) {
      logger.error(`${messages.person.errors.service.create}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
        validationErrors: formatErrorMessages('Person', messages.person.errors.service.create),
      }
    }
  },

  async updateUserPerson(body, transaction) {
    try {
      
      // destructuring Object
      const {
        username,
        email,
        roleId,
        firstName,
        secondName,
        surname,
        secondSurname,
        imageProfile,
        address,
        personId,
        userId,
      } = body;

      // Update therapist's user
      if(username || email || roleId) {
        const { error:userError, statusCode, message, validationErrors } = await updateUser(userId,{
          username,
          email,
          roleId
        },transaction);
        if(userError) {
          return {
            error: userError,
            statusCode,
            message,
            validationErrors
          }
        };
      };

      // Update Person
      if(firstName || secondName || surname || secondSurname || imageProfile || address) {
        // validate if person exist
        const personExist = await Person.findOne({
          where: {
            id: personId
          }
        });
        if(!personExist) {
          logger.error(messages.person.errors.not_found);
          return {
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('update', messages.person.errors.not_found),
          };
        }

        const personData = await Person.update({
          firstName,
          secondName,
          surname,
          secondSurname,
          imageProfile,
          address
        },{
          where: {
            id: personId
          }
        },{transaction});
        if(!personData) {
          logger.error(messages.person.errors.service.update);
          return {
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('update', messages.person.errors.service.update),
          };
        };
      };

      return {
        error: false,
      }

    } catch (error) {
      logger.error(`${messages.person.errors.service.update}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
        validationErrors: formatErrorMessages('update', messages.therapist.errors.service.update),
      }
    }
  }

}