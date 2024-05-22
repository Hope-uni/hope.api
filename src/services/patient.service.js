const logger = require('@config/logger.config');
const { Patient, TutorTherapist, User, Role, Person, UserRoles, sequelize } = require('@models/index.js');
const { pagination, messages, userPerson, dataStructure } = require('@utils/index');
const { Op } = require('sequelize');
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
            therapistId: {
              [Op.ne]: null
            }
          },
          attributes: {
            exclude: ['createdAt','updatedAt','status','personId']
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
                    }
                  ]
                },
              ]
            },
          ]
        });

        // Return Patient
        return {
          error: false,
          message: messages.patient.success.all,
          data: dataStructure.patientDataStructure(data),
        };
      }
      
      const { limit, offset } = pagination.paginationValidation(query.page, query.size);

      const data = await Patient.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: {
          status: true,
          therapistId: {
            [Op.ne]: null
          }
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
                  }
                ]
              },
            ]
          },
        ]
      });

      // get Patient structured
      data.rows = dataStructure.patientDataStructure(data.rows);

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

  async allPatientsWithoutTherapist(query) {
    try {

      if(!query.page || !query.size || parseInt(query.page) === 0 && parseInt(query.size) === 0) {
        const data = await Patient.findAll({
          where: {
            status: true,
            therapistId: null
          },
          attributes: {
            exclude: ['createdAt','updatedAt','status','personId']
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
                    }
                  ]
                },
              ]
            },
          ]
        });

        // Return Patient
        return {
          error: false,
          message: messages.patient.success.all,
          data: dataStructure.patientDataStructure(data),
        };
      }
      
      const { limit, offset } = pagination.paginationValidation(query.page, query.size);

      const data = await Patient.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: {
          status: true,
          therapistId: null
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
                  }
                ]
              },
            ]
          },
        ]
      });

      // get Patient structured
      data.rows = dataStructure.patientDataStructure(data.rows);

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
          exclude: ['createdAt','updatedAt','status','personId']
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
            include: [
              {
                model: Person,
              },
              {
                model: User,
              }
            ]
          },
          {
            model: TutorTherapist,
            as: 'therapist',
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: [
              {
                model: Person,
              },
              {
                model: User,
              }
            ]
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
                  }
                ]
              },
            ]
          },
        ]
      });

      if(!data) {
        return {
          error: true,
          message: messages.patient.errors.not_found,
          statusCode: 404
        }
      };

      return {
        error: false,
        message: messages.patient.success.found,
        data: dataStructure.findPatientDataStructure(data),
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
      
      // Destructuring Data
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
      if(therapistId) {
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
  
      }

      /* eslint-disable no-restricted-syntax */
      /* eslint-disable no-await-in-loop */
      for (const iterator of resData.roles) {
        if(iterator !== 4){
          await transaction.rollback();
          return {
            error: true,
            message: messages.patient.errors.service.not_role,
            statusCode: 400
          }
        }
      }

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
          exclude: ['createdAt','updatedAt','status','personId']
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
            include: [
              {
                model: Person,
              },
              {
                model: User,
              }
            ]
          },
          {
            model: TutorTherapist,
            as: 'therapist',
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: [
              {
                model: Person,
              },
              {
                model: User,
              }
            ]
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
                  }
                ]
              },
            ]
          },
        ]
      });

      return {
        error: false,
        message: messages.patient.success.create,
        data: dataStructure.findPatientDataStructure(newData),
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
      const { tutorId, therapistId,...resData } = body;

      // Tutor Exist validation
      if(tutorId) {
        const tutorExist = await TutorTherapist.findOne({
          where: {
            id: tutorId,
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

      if(therapistId) {
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
      }


      const { error:userPersonError, statusCode, message = messages.patient.errors.service.update } = await userPerson.updateUserPerson({
        ...resData,
        personId: patientExist.personId,
        userId: patientExist.userId,
      }, transaction);
      if(userPersonError) {
        await transaction.rollback();
        return {
          error: userPersonError,
          message,
          statusCode
        };
      };


      if(tutorId || therapistId) {
        const patientResponse = await Patient.update({
          tutorId,
          therapistId
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
      }

      // Commit transaction
      await transaction.commit();

      // find Patient
      const newData = await Patient.findOne({
        where: {
          id,
          status: true
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','personId']
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
            include: [
              {
                model: Person,
              },
              {
                model: User,
              }
            ]
          },
          {
            model: TutorTherapist,
            as: 'therapist',
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: [
              {
                model: Person,
              },
              {
                model: User,
              }
            ]
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
                  }
                ]
              },
            ]
          },
        ]
      });

      return {
        error: false,
        message: messages.patient.success.update,
        data: dataStructure.findPatientDataStructure(newData),
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
      const { error:userError, statusCode } = await deleteUser(patientExist.userId, transaction);
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
