const logger = require('@config/logger.config');
const { Op } = require('sequelize');
const { Tutor, User, Person, Permission, Role, sequelize } = require('@models/index.js');
const { paginationValidation, getPageData } = require('@utils/pagination.util');
const { 
  createUserPerson,
  updateUserPerson
} = require('@utils/user-person.util');
const { 
  deleteUser
} = require('./user.service');

module.exports = {

  async all(query) {
    try {
    
      // Pagination
      const { limit, offset } = paginationValidation(query.page, query.size);

      const data = await Tutor.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: {
          status: true
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        },
        include: [
          {
            model: Person,
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
          },
          {
            model: User,
            attributes: {
              exclude: ['createdAt','updatedAt','status','password']
            },
            include: [
              {
                model: Role,
                attributes: {
                  exclude: ['createdAt','updatedAt','status']
                },
                include: {
                  model: Permission,
                  as: 'permissions',
                  attributes: {
                    exclude: ['group','createdAt','updatedAt','status']
                  },
                  through: {
                    attributes: {
                      exclude: [
                        'id',
                        'createdAt',
                        'updatedAt',
                        'roleId',
                        'permissionId',
                      ]
                    }
                  }
                }
              }
            ]
          }
        ]
      });

      const dataResponse = getPageData(data, query.page, limit);

      return {
        error: false,
        message: 'Lista de Tutores',
        ...dataResponse
      }

    } catch (error) {
      logger.error(`There was an error in Tutor services: ${error}`);
      return {
        error: true,
        message: `There was an error in utor services: ${error}`,
        statusCode: 500
      }
    }
  },


  async findOne(id) {
    try {
      
      const data = await Tutor.findOne({
        where: {
          id,
          status: true
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        },
        include: [
          {
            model: Person,
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
          },
          {
            model: User,
            attributes: {
              exclude: ['createdAt','updatedAt','status','password']
            },
            include: [
              {
                model: Role,
                attributes: {
                  exclude: ['createdAt','updatedAt','status']
                },
                include: {
                  model: Permission,
                  as: 'permissions',
                  attributes: {
                    exclude: ['group','createdAt','updatedAt','status']
                  },
                  through: {
                    attributes: {
                      exclude: [
                        'id',
                        'createdAt',
                        'updatedAt',
                        'roleId',
                        'permissionId',
                      ]
                    }
                  }
                }
              }
            ]
          }
        ]
      });

      if(!data) {
        return {
          error: true,
          message: `Tutor no encontrado`,
          statusCode: 404,
        }
      };

      return {
        error: false,
        message: 'Tutor encontrado',
        data
      }

    } catch (error) {
      logger.error(`There was an error in Tutor services: ${error}`);
      return {
        error: true,
        message: `There was an error in utor services: ${error}`,
        statusCode: 500
      }
    }
  },


  async create(body) {
    const transaction = await sequelize.transaction();
    try {

      // Destructuring object
      const { identificationNumber, phoneNumber, telephone, ...resBody } = body;

      // IdentificationNumber validation
      const identificationNumberExist = await Tutor.findOne({
        where: {
          identificationNumber,
          status: true
        }
      });
      if(identificationNumberExist) {
        await transaction.rollback();
        return {
          error: true,
          message: 'El número de identificación ya está en uso',
          statusCode: 400
        };
      };

      // Phone number validation
      const phoneNumberExist = await Tutor.findOne({
        where: {
          phoneNumber,
          status: true
        }
      });
      if(phoneNumberExist) {
        await transaction.rollback();
        return {
          error: true,
          message: 'El número de teléfono ya está en uso',
          statusCode: 400
        };
      };

      // Telephone validation
      if(telephone) {
        const telephoneExist = await Tutor.findOne({
          where: {
            telephone,
            status: true
          }
        });
        if(telephoneExist) {
          await transaction.rollback();
          return {
            error: true,
            message: 'El número de teléfono convencional ya está en uso',
            statusCode: 400
          };
        };
      }

      // Validate and create User and Person
      const { error:userPersonError, message, statusCode, data } = await createUserPerson(resBody);
      if(userPersonError) {
        await transaction.rollback();
        return {
          error: userPersonError,
          message,
          statusCode
        };
      }

      // create Tutor
      const tutorResponse = await Tutor.create({
        identificationNumber,
        phoneNumber,
        telephone,
        idPerson: data.idPerson,
        idUser: data.idUser,
      },{transaction});
      if(!tutorResponse) {
        await transaction.rollback();
        return {
          error: true,
          message: 'Tutor no creado',
          statusCode: 400
        };
      };

      // commit transaction
      await transaction.commit();

      // find Tutor
      const newData = await Tutor.findOne({
        where: {
          id: tutorResponse.id,
          status: true
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        },
        include: [
          {
            model: Person,
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
          },
          {
            model: User,
            attributes: {
              exclude: ['createdAt','updatedAt','status','password']
            },
            include: [
              {
                model: Role,
                attributes: {
                  exclude: ['createdAt','updatedAt','status']
                },
                include: {
                  model: Permission,
                  as: 'permissions',
                  attributes: {
                    exclude: ['group','createdAt','updatedAt','status']
                  },
                  through: {
                    attributes: {
                      exclude: [
                        'id',
                        'createdAt',
                        'updatedAt',
                        'roleId',
                        'permissionId',
                      ]
                    }
                  }
                }
              }
            ]
          }
        ]
      });

      return {
        error: false,
        message: 'Tutor creado',
        data: newData
      };
    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in Tutor services: ${error}`);
      return {
        error: true,
        message: `There was an error in Tutor services: ${error}`,
        statusCode: 500
      }
    }
  },

  async update(id,body) {
    const transaction = await sequelize.transaction();
    try {
      // validate if tutor exist
      const tutorExist = await Tutor.findOne({
        where: {
          id,
          status: true
        }
      });
      if(!tutorExist) {
        return {
          error: true,
          message: 'Tutor no encontrado',
          statusCode: 404,
        }
      };

      // destructuring Object
      const {
        identificationNumber,
        phoneNumber,
        telephone,
        ...resData
      } = body;

      // validate if user and person is correct
      if(tutorExist.idUser !== resData.idUser || tutorExist.idPerson !== resData.idPerson) {
        await transaction.rollback();
        return {
          error: true,
          message: 'Identificador de usuario o identificador de persona no son correctos',
          statusCode: 400
        };
      }

      // identification number validation
      if(identificationNumber) {
        const identificationNumberExist = await Tutor.findOne({
          where: {
            identificationNumber,
            status: true,
            id: {
              [Op.ne]: id
            }
          }
        });
        if(identificationNumberExist) {
          await transaction.rollback();
          return {
            error: true,
            message: 'El número de identificación ya está en uso',
            statusCode: 400
          };
        };
      }
      // phone number validation
      if(phoneNumber) {
        const phoneNumberExist = await Tutor.findOne({
          where: {
            phoneNumber,
            status: true,
            id: {
              [Op.ne]: id
            }
          }
        });
        if(phoneNumberExist) {
          await transaction.rollback();
          return {
            error: true,
            message: 'El número de teléfono ya está en uso',
            statusCode: 400
          };
        };
      }
      // telephone validation
      if(telephone) {
        const telephoneExist = await Tutor.findOne({
          where: {
            telephone,
            status: true,
            id: {
              [Op.ne]: id
            }
          }
        });
        if(telephoneExist) {
          await transaction.rollback();
          return {
            error: true,
            message: 'El número de teléfono convencional ya está en uso',
            statusCode: 400
          };
        };
      }

      // Validate and update User and Person
      const { error:userPersonError, statusCode, message } = await updateUserPerson(resData);
      if(userPersonError) {
        await transaction.rollback();
        return {
          error: userPersonError,
          message,
          statusCode
        };
      };


      // update transaction
      const updateTutorResponse = await Tutor.update(
        {
          identificationNumber,
          phoneNumber,
          telephone
        },
        {
          where: {
            id
          },
          transaction
        }
      );
      if(!updateTutorResponse) {
        await transaction.rollback();
        return {
          error: true,
          message: 'Tutor no actualizado',
          statusCode: 400
        };
      };

      // Commit Transaction 
      await transaction.commit();

      // find Tutor
      const newData = await Tutor.findOne({
        where: {
          id,
          status: true
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        },
        include: [
          {
            model: Person,
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
          },
          {
            model: User,
            attributes: {
              exclude: ['createdAt','updatedAt','status','password']
            },
            include: [
              {
                model: Role,
                attributes: {
                  exclude: ['createdAt','updatedAt','status']
                },
                include: {
                  model: Permission,
                  as: 'permissions',
                  attributes: {
                    exclude: ['group','createdAt','updatedAt','status']
                  },
                  through: {
                    attributes: {
                      exclude: [
                        'id',
                        'createdAt',
                        'updatedAt',
                        'roleId',
                        'permissionId',
                      ]
                    }
                  }
                }
              }
            ]
          }
        ]
      });

      return {
        error: false,
        message: 'Tutor actualizado',
        data: newData
      }
    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in Tutor services: ${error}`);
      return {
        error: true,
        message: `There was an error in Tutor services: ${error}`,
        statusCode: 500
      }
    }
  },

  async removeTutor(id) {
    const transaction = await sequelize.transaction();
    try {
      // validate if tutor exist
      const tutorExist = await Tutor.findOne({
        where: {
          id,
          status: true
        }
      });
      if(!tutorExist) {
        return {
          error: true,
          message: 'Tutor no encontrado',
          statusCode: 404,
        }
      };

<<<<<<< HEAD
      // remove User
      const { error:userError, statusCode } = await deleteUser(tutorExist.idUser, transaction);
=======
      // update User
      const { error:userError, statusCode } = await deleteUser(tutorExist.idUser);
>>>>>>> develop
      if(userError) {
        await transaction.rollback();
        return {
          error: userError,
          message: 'Tutor no fue eliminado',
          statusCode
        }
      };

      // update transaction
      const updateTutorResponse = await Tutor.update(
        {
          status: false
        },
        {
          where: {
            id
          },
          transaction
        }
      );
      if(!updateTutorResponse) {
        await transaction.rollback();
        return {
          error: true,
          message: 'Tutor no fue eliminado',
          statusCode: 400
        };
      };

      // commit transaction
      await transaction.commit();

      return {
        error: false,
        message: 'Tutor eliminado',
      }
    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in Tutor services: ${error}`);
      return {
        error: true,
        message: `There was an error in Tutor services: ${error}`,
        statusCode: 500
      }
    }
  }

}