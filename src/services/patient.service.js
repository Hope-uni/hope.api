
const logger = require('@config/logger.config');
const { Patient, TutorTherapist, User, Role, Person, UserRoles, HealthRecord, TeaDegree, Phase, Observation, sequelize } = require('@models/index.js');
const { pagination, messages, userPerson, dataStructure } = require('@utils/index');
const { getPatients, getPatientsTutor, getPatientsTherapist } = require('@helpers/patient.helper');
const {
  getProgress
} = require('@helpers/healthRecord.helper');
const {
  deleteUser
} = require('./user.service');
const {
  createHealthRecord
} = require('./healthRecord.service');
const {
  createObservation
} = require('./observations.service');




module.exports = {

  /* eslint-disable radix */
  /* eslint-disable consistent-return */
  async all(query, payload) {
    try {

      if(query.tutor) {
        return await getPatientsTutor(query,payload);
      }

      if(query.therapist) {
        return await getPatientsTherapist(query,payload);
      }

      return await getPatients(query, payload);

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
            {
              model: HealthRecord,
              attributes: {
                exclude: ['createdAt','updatedAt','status','patientId']
              },
              include: [
                {
                  model: TeaDegree,
                  attributes: {
                    exclude: ['createdAt','updatedAt'],
                  }
                },
                {
                  model: Phase,
                  attributes: {
                    exclude: ['createdAt','updatedAt'],
                  }
                },
                {
                  model: Observation,
                  attributes: {
                    exclude: ['createdAt','updatedAt', 'status', 'userId', 'healthRecordId'],
                  }
                }
              ],
            }
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
          {
            model: HealthRecord,
            attributes: {
              exclude: ['createdAt','updatedAt','status','patientId']
            },
            include: [
              {
                model: TeaDegree,
                attributes: {
                  exclude: ['createdAt','updatedAt'],
                }
              },
              {
                model: Phase,
                attributes: {
                  exclude: ['createdAt','updatedAt'],
                }
              },
              {
                model: Observation,
                attributes: {
                  exclude: ['createdAt','updatedAt', 'status', 'userId', 'healthRecordId'],
                }
              }
            ],
          }
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
          {
            model: HealthRecord,
            attributes: {
              exclude: ['createdAt','updatedAt','status','patientId']
            },
            include: [
              {
                model: TeaDegree,
                attributes: {
                  exclude: ['createdAt','updatedAt'],
                }
              },
              {
                model: Phase,
                attributes: {
                  exclude: ['createdAt','updatedAt'],
                }
              },
              {
                model: Observation,
                attributes: {
                  exclude: ['createdAt','updatedAt', 'status', 'userId', 'healthRecordId'],
                }
              }
            ],
          }
        ]
      });

      
      if(!data) {
        return {
          error: true,
          message: messages.patient.errors.not_found,
          statusCode: 404
        }
      };

      // Get Progress of the Patient about his phase level and activities score
      const { error:progressError, message: progressMessage, phaseProgress } = await getProgress(data.id);
      if(progressError) {
        return {
          error: progressError,
          message: progressMessage,
          statusCode: 400
        }
      }

      data.phaseProgress = phaseProgress;

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
      const { 
        tutorId, 
        therapistId, 
        phaseId, 
        teaDegreeId, 
        observations = '', 
        ...resData 
      } = body;
      

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

      // Setting rol to patient.
      resData.roles = [4];

      const { error:userPersonError, statusCode, message = messages.patient.errors.service.create, data  } = await userPerson.createUserPerson(resData, transaction);
      if(userPersonError) {
        await transaction.rollback();
        return {
          error: userPersonError, 
          message,
          statusCode
        };
      };

      // Creating the new Patient
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

      // Create a HealthRecord
      const { error:healthRecordError, statusCode: healthRecordStatusCode, message: healthRecordMessage, healthRecordCreated } = await createHealthRecord({
        teaDegreeId,
        phaseId,
        patientId: patientResponse.id,
      }, transaction);

      if(healthRecordError) {
        return {
          error: healthRecordError,
          message: healthRecordMessage,
          statusCode: healthRecordStatusCode                                                          
        }
      };

      // Creating observation.
      if(observations !== '') {
        const observationPayload = {
          description: observations,
          userId: patientResponse.userId,
          healthRecordId: healthRecordCreated.id
        }

        const { error: observationError, message: observationMessage } = await createObservation( observationPayload,transaction);

        if(observationError) {
          return {
            error: observationError,
            message: observationMessage,
            statusCode: 400
          }
        }
      }



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
          {
            model: HealthRecord,
            attributes: {
              exclude: ['createdAt','updatedAt','status','patientId']
            },
            include: [
              {
                model: TeaDegree,
                attributes: {
                  exclude: ['createdAt','updatedAt'],
                }
              },
              {
                model: Phase,
                attributes: {
                  exclude: ['createdAt','updatedAt'],
                }
              },
              {
                model: Observation,
                attributes: {
                  exclude: ['createdAt','updatedAt', 'status', 'userId', 'healthRecordId'],
                }
              }
            ],
          }
        ]
      });

      // Get Progress of the Patient about his phase level and activities score
      const { error:progressError, message: progressMessage, phaseProgress } = await getProgress(newData.id);
      if(progressError) {
        return {
          error: progressError,
          message: progressMessage,
          statusCode: 400
        }
      }

      newData.phaseProgress = phaseProgress;

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
