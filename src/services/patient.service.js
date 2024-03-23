const logger = require('@config/logger.config');
const { Patient, Tutor, User, Role, Permission, Person, sequelize } = require('@models/index.js');
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
      
      const { limit, offset } = paginationValidation(query.page, query.size);

      const data = await Patient.findAndCountAll({
        limit,
        offset,
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
            model: Tutor,
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: {
              model: Person,
              attributes: ['id', 'firstName', 'surname']
            }
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
        ...dataResponse
      };

    } catch (error) {
      logger.error(`There was an error in Patient services: ${error}`);
      return {
        error: true,
        message: `There was an error in Patient services: ${error}`,
        statusCode: 500
      }
    }
  },

  async findOne(id) {
    try {
      
      const data = await Patient.findOne({
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
            model: Tutor,
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: {
              model: Person,
              attributes: ['id', 'firstName', 'surname']
            }
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
          message: 'Paciente no encontrado',
          statusCode: 404
        }
      };

      return {
        error: false,
        message: 'Paciente encontrado',
        data
      };

    } catch (error) {
      logger.error(`There was an error in Patient services: ${error}`);
      return {
        error: true,
        message: `There was an error in Patient services: ${error}`,
        statusCode: 500
      }
    }
  },

  async create(body) {
    const transaction = await sequelize.transaction();
    try {
      
      const { age, idTutor, ...resData } = body;

      // Tutor Exist validation
      const tutorExist = await Tutor.findOne({
        where: {
          id: idTutor,
          status: true
        }
      });
      if(!tutorExist) {
        await transaction.rollback();
        return {
          error: true,
          message: 'Tutor no encontrado',
          statusCode: 404
        };
      };

      const { error:userPersonError, statusCode, message = 'Paciente no creado', data  } = await createUserPerson(resData, transaction);
      if(userPersonError) {
        return {
          error: userPersonError,
          message,
          statusCode
        };
      };

      const patientResponse = await Patient.create({
        age,
        idPerson: data.idPerson,
        idUser: data.idUser,
        idTutor
      },{transaction});
      if(!patientResponse) {
        await transaction.rollback();
        return {
          error: true,
          message: 'Paciente no creado',
          statusCode: 400
        };
      };

      // commit transaction
      await transaction.commit();

      // find Patient
      const newData = await Patient.findOne({
        where: {
          id: patientResponse.id,
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
            model: Tutor,
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: {
              model: Person,
              attributes: ['id', 'firstName', 'surname']
            }
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
        message: 'Paciente creado',
        data: newData
      };
    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in Patient services: ${error}`);
      return {
        error: true,
        message: `There was an error in Patient services: ${error}`,
        statusCode: 500
      }
    }
  },

  async update(id,body) {
    const transaction = await sequelize.transaction();
    try {

      // validate if patient exist
      const patientExist = await Patient.findOne({
        where: {
          id,
          status: true
        }
      });
      if(!patientExist) {
        await transaction.rollback();
        return {
          error: true,
          message: 'Paciente no encontrado',
          statusCode: 404
        };
      };
      
      // Destructuring Object
      const { age, idTutor,...resData } = body;

      // Tutor Exist validation
      if(idTutor) {
        const tutorExist = await Tutor.findOne({
          where: {
            id: idTutor,
            status: true
          }
        });
        if(!tutorExist) {
          await transaction.rollback();
          return {
            error: true,
            message: 'Tutor no encontrado',
            statusCode: 404
          };
        };	
      };


      const { error:userPersonError, statusCode, message = 'Paciente no actualizado' } = await updateUserPerson(resData, transaction);
      if(userPersonError) {
        return {
          error: userPersonError,
          message,
          statusCode
        };
      };


      const patientResponse = await Patient.update({
        age,
        idTutor
      },{
        where: {
          id
        },
        transaction
      });
      if(!patientResponse) {
        await transaction.rollback();
        return {
          error: true,
          message: 'Paciente no actualizado',
          statusCode: 400
        };
      };

      // Commit transaction
      await transaction.commit();

      // find Patient
      const newData = await Patient.findOne({
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
            model: Tutor,
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: {
              model: Person,
              attributes: ['id', 'firstName', 'surname']
            }
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
        message: 'Paciente actualizado',
        data: newData
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in Patient services: ${error}`);
      return {
        error: true,
        message: `There was an error in Patient services: ${error}`,
        statusCode: 500
      }
    }
  },

  async removePatient(id) {
    const transaction = await sequelize.transaction();
    try {
      
      // validate if patient exist
      const patientExist = await Patient.findOne({
        where: {
          id,
          status: true
        }
      });
      if(!patientExist) {
        return {
          error: true,
          message: 'Paciente no encontrado',
          statusCode: 404
        };
      };
  
      // remove user 
      const { error:userError, statusCode } = await deleteUser(patientExist.idUser);
      if(userError) {
        await transaction.rollback();
        return {
          error: userError,
          message: 'Paciente no fue eliminado',
          statusCode
        }
      };

      // remove patient
      const patientResponse = await Patient.update({
        status: false
      },{
        where: {
          id
        },
        transaction
      });
      if(!patientResponse) {
        await transaction.rollback();
        return {
          error: true,
          message: 'Paciente no eliminado',
          statusCode: 400
        };
      };

      // Commit transaction
      await transaction.commit();

      return {
        error: false,
        message: 'Paciente eliminado',
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in Patient services: ${error}`);
      return {
        error: true,
        message: `There was an error in Patient services: ${error}`,
        statusCode: 500
      }
    }
  }

}
