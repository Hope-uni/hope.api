const logger = require('@config/logger.config');
const { Person, sequelize } = require('@models/index.js');
const { 
  createUser,
  updateUser
} = require('@services/user.service');


module.exports = {

  async createUserPerson(body) {
    const transaction = await sequelize.transaction();
    try {
      
      // destructuring Object
      const {
        username,
        password,
        email,
        roleId,
        firstName,
        secondName,
        surname,
        secondSurname,
        imageProfile,
        address
      } = body;

    // User creation
    const { error:dataError, statusCode, message, data:userData } = await createUser({
      username,
      password,
      email,
      roleId
    }, transaction);
    if(dataError) {
      return {
        error: dataError,
        message,
        statusCode
      }
    };

    // Person creation
    const personData = await Person.create({
      firstName,
      secondName,
      surname,
      secondSurname,
      imageProfile,
      address
    },{transaction});
    if(!personData) {
      logger.error(`Persona no pudo ser creada`);
      return {
        error: true,
        message: 'Tutor no creado',
        statusCode: 400
      };
    };

    // commit transaction
    await transaction.commit();

    return {
      data: {
        idUser: userData.id,
        idPerson: personData.id
      }
    }

    } catch (error) {
      logger.error(`There was an error in  User-Person util: ${error}`);
      return {
        error: true,
        message: `There was an error in User-Person util: ${error}`,
        statusCode: 500
      }
    }
  },

  async updateUserPerson(body) {
    const transaction = await sequelize.transaction();
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
        idPerson,
        idUser,
      } = body;

      // Update therapist's user
      if(username || email || roleId) {
        const { error:userError, statusCode, message } = await updateUser(idUser,{
          username,
          email,
          roleId
        },transaction);
        if(userError) {
          return {
            error: userError,
            message,
            statusCode
          }
        };
      };

      // Update Person
      if(firstName || secondName || surname || secondSurname || imageProfile || address) {
<<<<<<< HEAD
        // validate if person exist
        const personExist = await Person.findOne({
          where: {
            id: idPerson
          }
        });
        if(!personExist) {
          logger.error(`La entidad persona que desea modificar no esta activa o no existe en el sistema`);
          return {
            error: true,
            statusCode: 400
          };
        }

=======
>>>>>>> develop
        const personData = await Person.update({
          firstName,
          secondName,
          surname,
          secondSurname,
          imageProfile,
          address
        },{
          where: {
            id: idPerson
          }
        },{transaction});
        if(!personData) {
          return {
            error: true,
            message: 'Tutor no actualizado',
            statusCode: 400
          };
        };
      };

      return {
        error: false,
      }

    } catch (error) {
      logger.error(`There was an error in  User-Person util: ${error}`);
      return {
        error: true,
        message: `There was an error in User-Person util: ${error}`,
        statusCode: 500
      }
    }
  }

}