const { Op } = require('sequelize');
const logger = require('@config/logger.config');
const { 
  Patient, 
  TutorTherapist, 
  User, 
  Role, 
  Person, 
  UserRoles,
  HealthRecord, 
  TeaDegree, 
  Phase, 
  Observation, 
  PatientActivity,
  Activity, 
  sequelize 
} = require('@models/index.js');
const { pagination, messages, dataStructure, formatErrorMessages, generatePassword } = require('@utils/index');
const { getProgress, userSendEmail } = require('@helpers/index');
const { deleteUser, createUser, updateUser } = require('./user.service');
const { createHealthRecord } = require('./healthRecord.service');
const { createObservation } = require('./observations.service');




module.exports = {

  /* eslint-disable radix */
  /* eslint-disable consistent-return */
  async all(query, payload) {
    try {
      
      const userType = await User.findOne({
        where: {
          id: payload.id,
          status: true,
        },
        include: [
          {
            model: UserRoles,
            include: [
              {
                model: Role,
                where: {
                  id: {
                    [Op.notIn]: [3,4,5]
                  }
                }
              }
            ]
          }
        ]
      });

      if(!userType.UserRoles[0]) {
        return {
          error: true,
          statusCode: 403,
          message: messages.patient.errors.service.forbidden,
        }
      }

      if(!query.page || !query.size || parseInt(query.page) === 0 && parseInt(query.size) === 0) {
        const data = await Patient.findAll({
          where: {
            status: true,
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
          statusCode: 200,
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
        statusCode: 200,
        message: messages.patient.success.all,
        ...dataResponse
      };

    } catch (error) {
      logger.error(`${messages.patient.errors.service.base}: ${error}`);
      return {
        error: true,
        message: messages.generalMessages.server,
        statusCode: 500,
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
          statusCode: 200,
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
        statusCode: 200,
        message: messages.patient.success.all,
        ...dataResponse
      };

    } catch (error) {
      logger.error(`${messages.patient.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
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
            model: User,
            where: {
              status: true
            },
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
            model: PatientActivity,
            attributes: {
              exclude: ['createdAt','updatedAt']
            },
            include: [
              {
                model: Activity,
                include: [
                  {
                    model: Phase,
                  }
                ]
              }
            ],
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
                  exclude: ['updatedAt', 'status', 'healthRecordId'],
                },
                include: [
                  {
                    model: User,
                    attributes: ['username'],
                  }
                ]
              }
            ],
          }
        ]
      });

      
      if(!data) {
        return {
          error: true,
          statusCode: 404,
          message: messages.patient.errors.not_found,
        }
      };

      // Get Progress of the Patient about his phase level and activities score
      const { error:progressError, message: progressMessage, generalProgress } = await getProgress(data.id);
      if(progressError) {
        return {
          error: progressError,
          statusCode: 409,
          message: progressMessage,
        }
      }
      data.generalProgress = generalProgress;

      return {
        error: false,
        statusCode: 200,
        message: messages.patient.success.found,
        data: dataStructure.findPatientDataStructure(data),
      };

    } catch (error) {
      logger.error(`${messages.patient.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

  async create(body, payload) {
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
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('tutor', messages.tutor.errors.not_found),
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
            statusCode: 404,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('therapist', messages.therapist.errors.not_found),
          };
        };
      }

      // Setting rol to patient and generate the temporary password.
      resData.roles = [4];
      const passwordTemp = generatePassword(); // generate the temporary password using uuid and get the first 8 characters
      resData.password = passwordTemp;

      const { error:userPersonError, statusCode, message, validationErrors, data  } = await createUser(resData, transaction);
      if(userPersonError) {
        await transaction.rollback();
        return {
          error: userPersonError, 
          statusCode,
          message,
          validationErrors,	
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
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('create', messages.patient.errors.service.create),
        };
      };

      // Create a HealthRecord
      const { error:healthRecordError, statusCode: healthRecordStatusCode, message: healthRecordMessage, validationErrors: healthRecordValidationErrors, healthRecordCreated } = await createHealthRecord({
        teaDegreeId,
        phaseId,
        patientId: patientResponse.id,
      }, transaction);

      if(healthRecordError) {
        return {
          error: healthRecordError,
          message: healthRecordMessage,
          statusCode: healthRecordStatusCode,  
          validationErrors: healthRecordValidationErrors                                                        
        }
      };

      // Creating observation.
      if(observations !== '') {
        const observationPayload = {
          description: observations,
          userId: payload.id,
          healthRecordId: healthRecordCreated.id
        }

        const { error: observationError, message: observationMessage, validationErrors: observationValidationErrors, statusCode: observationStatusCode } = await createObservation( observationPayload,transaction);

        if(observationError) {
          return {
            error: observationError,
            statusCode: observationStatusCode,
            message: observationMessage,
            validationErrors: observationValidationErrors,
          }
        }
      }

      // Send email with the temporary password
      const { error: emailError, message: emailMessage } = await userSendEmail({
        email: resData.email,
        password: passwordTemp,
        username: resData.username,
      });

      if(emailError) {
        await transaction.rollback();
        return {
          error: emailError,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('sendEmail', emailMessage),
        }
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
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('patient', progressMessage),
        }
      }

      newData.phaseProgress = phaseProgress;

      return {
        error: false,
        statusCode: 201,
        message: messages.patient.success.create,
        data: dataStructure.patientDataStructure(newData, true),
      };
    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.patient.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
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
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('patient', messages.patient.errors.not_found),
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
            statusCode: 404,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('tutor', messages.tutor.errors.not_found),
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
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('therapist', messages.therapist.errors.not_found),
        };
      };
      }

      const { error:userPersonError, statusCode, message, validationErrors } = await updateUser(patientExist.userId,
        {
          ...resData,
        personId: patientExist.personId,
      }, 
      transaction,
    );
      if(userPersonError) {
        await transaction.rollback();
        return {
          error: userPersonError,
          statusCode,
          message,
          validationErrors,
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
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('update', messages.patient.errors.service.update),
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
                  exclude: ['updatedAt', 'status', 'userId', 'healthRecordId'],
                },
                include: [
                  {
                    model: User
                  }
                ]
              }
            ],
          }
        ]
      });

      return {
        error: false,
        statusCode: 200,
        message: messages.patient.success.update,
        data: dataStructure.updatePatientDataStructure(newData),
      }

    } catch (error) {
      logger.error(`${messages.patient.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
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
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('patient', messages.patient.errors.not_found),
        };
      };
  
      // remove user 
      const { error:userError, statusCode, validationErrors } = await deleteUser(patientExist.userId, transaction);
      if(userError) {
        await transaction.rollback();
        return {
          error: userError,
          statusCode,
          message: messages.patient.errors.service.delete,
          validationErrors,
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
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('delete', messages.patient.errors.service.delete),
        };
      };

      // Commit transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.patient.success.delete,
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.patient.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

}
