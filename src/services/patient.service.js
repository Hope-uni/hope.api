const logger = require('@config/logger.config');
const { Patient, TutorTherapist, User, Role, Permission, Person, UserRoles, sequelize } = require('@models/index.js');
const { pagination, messages, userPerson, dates } = require('@utils/index');
const {
  deleteUser
} = require('./user.service');



module.exports = {

  /* eslint-disable radix */
  /* eslint-disable consistent-return */
  async all(query) {
    try {

      if(!query.page || !query.size || parseInt(query.page) === 0 && parseInt(query.size) === 0) {
        const data = await Patient.findAll({
          where: {
            status: true,
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
              model: TutorTherapist,
              as: 'tutor',
              attributes: {
                exclude: ['createdAt','updatedAt','status']
              },
              include: {
                model: Person,
                attributes: ['id', 'firstName', 'surname']
              }
            },
            {
              model: TutorTherapist,
              as: 'therapist',
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
                  model: UserRoles,
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
                          exclude: ['group','createdAt','updatedAt']
                        },
                        through: {
                          attributes: {
                            exclude: [
                              'id',
                              'createdAt',
                              'updatedAt',
                              'roleId',
                              'permissionId'
                            ]
                          }
                        }
                      }
                    }
                  ]
                }
              ]
            }
          ]
        });

        // Return Patient
        return {
          error: false,
          message: messages.patient.success.all,
          data: dates.getAllAges(data), // getAllAges method is just for get the age from the birthday,
        };
      }
      
      const { limit, offset } = pagination.paginationValidation(query.page, query.size);

      const data = await Patient.findAndCountAll({
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
            model: TutorTherapist,
            as: 'tutor',
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: {
              model: Person,
              attributes: ['id', 'firstName', 'surname']
            }
          },
          {
            model: TutorTherapist,
            as: 'therapist',
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
                model: UserRoles,
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
                        exclude: ['group','createdAt','updatedAt']
                      },
                      through: {
                        attributes: {
                          exclude: [
                            'id',
                            'createdAt',
                            'updatedAt',
                            'roleId',
                            'permissionId'
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      });

      // Add patient's age
      data.rows = dates.getAllAges(data.rows); // getAllAges method is just for get the age from the birthday

      const dataResponse = pagination.getPageData(data, query.page, limit);

      return {
        error: false,
        message: messages.patient.success.all,
        ...dataResponse
      };

    } catch (error) {
      logger.error(`${messages.patient.errors.service.base}: ${error}`);
      return {
        error: true,
        message: `${messages.patient.errors.service.base}: ${error}`,
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
            model: TutorTherapist,
            as: 'tutor',
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: {
              model: Person,
              attributes: ['id', 'firstName', 'surname']
            }
          },
          {
            model: TutorTherapist,
            as: 'therapist',
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
                model: UserRoles,
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
                        exclude: ['group','createdAt','updatedAt']
                      },
                      through: {
                        attributes: {
                          exclude: [
                            'id',
                            'createdAt',
                            'updatedAt',
                            'roleId',
                            'permissionId'
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      });

      if(!data) {
        return {
          error: true,
          message: messages.patient.errors.not_found,// 'Paciente no encontrado',
          statusCode: 404
        }
      };

      return {
        error: false,
        message: messages.patient.success.found,
        data
      };

    } catch (error) {
      logger.error(`${messages.patient.errors.service.base}: ${error}`);
      return {
        error: true,
        message: `${messages.patient.errors.service.base}: ${error}`,
        statusCode: 500
      }
    }
  },

  async create(body) {
    const transaction = await sequelize.transaction();
    try {
      
      const { tutorId, therapistId, ...resData } = body;

      // Tutor Exist validation
      const tutorExist = await TutorTherapist.findOne({
        where: {
          id: tutorId,
          status: true
        },
        include: [
          {
            model: User,
            include: [
              {
                model: UserRoles,
                include: {
                  model: Role,
                  where: {
                    name: 'Tutor',
                  }
                }
              }
            ]
          }
        ]
      });
      if(!tutorExist) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.tutor.errors.not_found,
          statusCode: 404
        };
      };

      // Therapist Exist validation
      const therapistExist = await TutorTherapist.findOne({
        where: {
          id: therapistId,
          status: true
        },
        include: [
          {
            model: User,
            include: [
              {
                model: UserRoles,
                include: {
                  model: Role,
                  where: {
                    name: 'Terapeuta',
                  }
                }
              }
            ]
          }
        ]
      });
      if(!therapistExist) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.therapist.errors.not_found,
          statusCode: 404
        };
      };

      const { error:userPersonError, statusCode, message = messages.patient.errors.service.create, data  } = await userPerson.createUserPerson(resData, transaction);
      if(userPersonError) {
        await transaction.rollback();
        return {
          error: userPersonError,
          message,
          statusCode
        };
      };

      const patientResponse = await Patient.create({
        personId: data.personId,
        userId: data.userId,
        tutorId,
        therapistId
      },{transaction});
      if(!patientResponse) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.patient.errors.service.create,
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
            model: TutorTherapist,
            as: 'tutor',
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: {
              model: Person,
              attributes: ['id', 'firstName', 'surname']
            }
          },
          {
            model: TutorTherapist,
            as: 'therapist',
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
                model: UserRoles,
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
                        exclude: ['group','createdAt','updatedAt']
                      },
                      through: {
                        attributes: {
                          exclude: [
                            'id',
                            'createdAt',
                            'updatedAt',
                            'roleId',
                            'permissionId'
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      });

      return {
        error: false,
        message: messages.patient.success.create,
        data: newData
      };
    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.patient.errors.service.base}: ${error}`);
      return {
        error: true,
        message: `${messages.patient.errors.service.base}: ${error}`,
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
          message: messages.patient.errors.not_found,
          statusCode: 404
        };
      };
      
      // Destructuring Object
      const { age, idTutor,...resData } = body;

      // Validate if user and person are correct
      if(patientExist.idUser !== resData.idUser || patientExist.idPerson !== resData.idPerson) {
        await transaction.rollback();
        return {
          error: true,
          message: 'Identificador de usuario o identificador de persona no son correctos',
          statusCode: 400
        };
      }

      // Tutor Exist validation
      if(idTutor) {
        const tutorExist = await TutorTherapist.findOne({
          where: {
            id: idTutor,
            status: true
          }
        });
        if(!tutorExist) {
          await transaction.rollback();
          return {
            error: true,
            message: messages.tutor.errors.not_found,
            statusCode: 404
          };
        };	
      };


      const { error:userPersonError, statusCode, message = messages.patient.errors.service.update } = await userPerson.updateUserPerson(resData, transaction);
      if(userPersonError) {
        await transaction.rollback();
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
          message: messages.patient.errors.service.update,
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
            model: TutorTherapist,
            as: 'tutor',
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: {
              model: Person,
              attributes: ['id', 'firstName', 'surname']
            }
          },
          {
            model: TutorTherapist,
            as: 'therapist',
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
                model: UserRoles,
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
                        exclude: ['group','createdAt','updatedAt']
                      },
                      through: {
                        attributes: {
                          exclude: [
                            'id',
                            'createdAt',
                            'updatedAt',
                            'roleId',
                            'permissionId'
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      });

      return {
        error: false,
        message: messages.patient.success.update,
        data: newData
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.patient.errors.service.base}: ${error}`);
      return {
        error: true,
        message: `${messages.patient.errors.service.base}: ${error}`,
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
          message: messages.patient.errors.not_found,
          statusCode: 404
        };
      };
  
      // remove user 
      const { error:userError, statusCode } = await deleteUser(patientExist.idUser, transaction);
      if(userError) {
        await transaction.rollback();
        return {
          error: userError,
          message: messages.patient.errors.service.delete,
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
          message: messages.patient.errors.service.delete,
          statusCode: 400
        };
      };

      // Commit transaction
      await transaction.commit();

      return {
        error: false,
        message: messages.patient.success.delete,
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.patient.errors.service.base}: ${error}`);
      return {
        error: true,
        message: `${messages.patient.errors.service.base}: ${error}`,
        statusCode: 500
      }
    }
  }

}
