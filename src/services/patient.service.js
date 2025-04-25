const { Op, Sequelize } = require('sequelize');
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
  AchievementsHealthRecord,
  Achievement,
  sequelize
} = require('@models/index.js');
const { getProgress, userSendEmail, getCustomPictograms } = require('@helpers');
const { pagination, messages, dataStructure, formatErrorMessages, generatePassword } = require('@utils');
const { roleConstants } = require('@constants');
const { deleteUser, createUser, updateUser } = require('./user.service');
const { createHealthRecord } = require('./healthRecord.service');
const { createObservation } = require('./observations.service');




module.exports = {

  /* eslint-disable radix */
  /* eslint-disable consistent-return */
  async all(query) {
    try {

      // Variables
      let therapistWhereCondition = {
        status: true,
      }

      if(query.therapistId) {
        const therapistResponse = await TutorTherapist.findOne({
          where: {
            id: parseInt(query.therapistId)
          },
          include: [
            {
              model: User,
              include: [
                {
                  model: UserRoles,
                  where: {
                    roleId: 3
                  }
                }
              ]
            }
          ]
        });

        if(!therapistResponse) {
          return {
            error: true,
            statusCode: 404,
            message: messages.therapist.errors.not_found
          }
        }

        therapistWhereCondition = {
          ...therapistWhereCondition,
          id: therapistResponse.id
        }
      }

      // Patient include variable
      let conditinalInclude = [
        {
          model: Person,
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'status']
          },
        },
        {
          model: User,
          where: {
            status: true,
          },
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'status', 'password']
          },
          include: [
            {
              model: UserRoles,
              include: [
                {
                  model: Role,
                  attributes: {
                    exclude: ['createdAt', 'updatedAt', 'status']
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
            exclude: ['createdAt', 'updatedAt', 'status']
          },
          include: {
            model: Person,
            attributes: ['id', 'firstName', 'surname']
          }
        },
        {
          model: TutorTherapist,
          as: 'therapist',
          where: therapistWhereCondition,
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'status']
          },
          include: {
            model: Person,
            attributes: ['id', 'firstName', 'surname']
          }
        },
        {
          model: HealthRecord,
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'status', 'patientId']
          },
          include: [
            {
              model: AchievementsHealthRecord,
              include: {
                model: Achievement,
                attributes: ['id', 'name', 'imageUrl']
              }
            },
            {
              model: TeaDegree,
              attributes: {
                exclude: ['createdAt', 'updatedAt'],
              }
            },
            {
              model: Phase,
              attributes: {
                exclude: ['createdAt', 'updatedAt'],
              }
            },
            {
              model: Observation,
              attributes: {
                exclude: ['createdAt', 'updatedAt', 'status', 'userId', 'healthRecordId'],
              }
            }
          ],
        },
      ];

      // validate if activityId query was retrieved in the request. This query param will allow us to get all patients that has this activity.
      if(query.activityId) {
        conditinalInclude = [
          ...conditinalInclude,
          {
            model: PatientActivity,
            where: {
              activityId: parseInt(query.activityId),
              isCompleted: false,
              status: true,
            }
          }
        ]
      }

      // This query param will allow us to get all patients that has an activity assigned
      if(!query.activityId && query.hasActiveActivity && query.hasActiveActivity === 'true') {
        conditinalInclude = [
          ...conditinalInclude,
          {
            model: PatientActivity,
            where: {
              isCompleted: false,
              status: true,
            }
          }
        ]
      }


      if(!query.page || !query.size || parseInt(query.page) === 0 && parseInt(query.size) === 0) {
        const data = await Patient.findAll({
          where: {
            status: true,
          },
          order: [['createdAt', 'ASC']],
          attributes: {
            exclude: ['createdAt','updatedAt','status','personId']
          },
          include: conditinalInclude,
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
        order: [['createdAt', 'ASC']],
        where:{
          status: true,
        },
        attributes: {
          exclude: ['updatedAt','status']
        },
        include: conditinalInclude,
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

  async allPatientsAvailableForActivities(activityId,query, payload) {
    try {

      // adding therapistId if this one is necessary
      const setTherapist = (therapist = { [Op.ne]: null }) => {
        return {
          [Op.and]: [
            {
              status: true,
              therapistId: therapist
            },
            {
              [Op.or]: [
                {
                  id: {
                    [Op.notIn]: Sequelize.literal(`(SELECT pa."patientId" FROM "PatientActivities" pa)`)
                  }
                },
                {
                  id: {
                    [Op.notIn]: Sequelize.literal(`(SELECT pa."patientId" FROM "Patients" p left join "PatientActivities" pa on p.id = pa."patientId" WHERE pa.status = true AND pa."isCompleted" = false)`)
                  }
                }
              ]
            }
          ],
        }
      }
      // Variables
      let patientWhereCondition = setTherapist();

      // validate if activity Exist
      const activityExist = await Activity.findOne({
        where: {
          id: activityId,
          status: true,
        }
      });
      if(!activityExist) {
        return {
          error: true,
          statusCode: 404,
          message: messages.activity.errors.not_found
        }
      }


      // Validate if therapist has the patient in charged.
      if(payload.roles.includes(roleConstants.THERAPIST_ROLE)) {
        const therapistExist = await TutorTherapist.findOne({
          where: {
            userId: payload.id,
            status: true,
          }
        });

        if(!therapistExist) {
          return {
            error: true,
            statusCode: 404,
            message: messages.therapist.errors.not_found
          }
        }

        // adding therapist id for get patients that belongs to this therapist.
        patientWhereCondition = setTherapist(therapistExist.id);
      }

      // Get patients without pagination.
      if(!query.page || !query.size || parseInt(query.page) === 0 && parseInt(query.size) === 0) {
        const data = await Patient.findAll({
          where: patientWhereCondition,
          order: [['createdAt', 'ASC']],
          attributes: {
            exclude: ['createdAt','updatedAt','status','personId']
          },
          include: [
            {
              model: Person,
              attributes: {
                exclude: ['createdAt', 'updatedAt', 'status']
              },
            },
            {
              model: User,
              attributes: {
                exclude: ['createdAt', 'updatedAt', 'status', 'password']
              },
              include: [
                {
                  model: UserRoles,
                  include: [
                    {
                      model: Role,
                      attributes: {
                        exclude: ['createdAt', 'updatedAt', 'status']
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
                exclude: ['createdAt', 'updatedAt', 'status']
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
                exclude: ['createdAt', 'updatedAt', 'status']
              },
              include: {
                model: Person,
                attributes: ['id', 'firstName', 'surname']
              }
            },
            {
              model: HealthRecord,
              where: {
                phaseId: activityExist.phaseId
              },
              attributes: {
                exclude: ['createdAt', 'updatedAt', 'status', 'patientId']
              },
              include: [
                {
                  model: AchievementsHealthRecord,
                  include: {
                    model: Achievement,
                    attributes: ['id', 'name', 'imageUrl']
                  }
                },
                {
                  model: TeaDegree,
                  attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                  }
                },
                {
                  model: Phase,
                  attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                  }
                },
                {
                  model: Observation,
                  attributes: {
                    exclude: ['createdAt', 'updatedAt', 'status', 'userId', 'healthRecordId'],
                  }
                }
              ],
            },
          ],
        });

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
        order: [['createdAt', 'ASC']],
        where: patientWhereCondition,
        attributes: {
          exclude: ['updatedAt','status']
        },
        include: [
          {
            model: Person,
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'status']
            },
          },
          {
            model: User,
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'status', 'password']
            },
            include: [
              {
                model: UserRoles,
                include: [
                  {
                    model: Role,
                    attributes: {
                      exclude: ['createdAt', 'updatedAt', 'status']
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
              exclude: ['createdAt', 'updatedAt', 'status']
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
              exclude: ['createdAt', 'updatedAt', 'status']
            },
            include: {
              model: Person,
              attributes: ['id', 'firstName', 'surname']
            }
          },
          {
            model: HealthRecord,
            where: {
              phaseId: activityExist.phaseId
            },
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'status', 'patientId']
            },
            include: [
              {
                model: AchievementsHealthRecord,
                include: {
                  model: Achievement,
                  attributes: ['id', 'name', 'imageUrl']
                }
              },
              {
                model: TeaDegree,
                attributes: {
                  exclude: ['createdAt', 'updatedAt'],
                }
              },
              {
                model: Phase,
                attributes: {
                  exclude: ['createdAt', 'updatedAt'],
                }
              },
              {
                model: Observation,
                attributes: {
                  exclude: ['createdAt', 'updatedAt', 'status', 'userId', 'healthRecordId'],
                }
              }
            ],
          },
        ],
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
          order: [['createdAt', 'ASC']],
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
                  model: AchievementsHealthRecord,
                  include: {
                    model: Achievement,
                    attributes: ['id', 'name', 'imageUrl']
                  }
                },
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
        order: [['createdAt', 'ASC']],
        where: {
          status: true,
          therapistId: null
        },
        attributes: {
          exclude: ['updatedAt','status']
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
                model: AchievementsHealthRecord,
                include: {
                  model: Achievement,
                  attributes: ['id', 'name', 'imageUrl']
                }
              },
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

  async findOne(id, payload) {
    try {

      // Variables
      let whereCondition = {
        id,
        status: true,
      }

      // Validate if the user logged is Therapist, if this true, we validate searching just patients assigned to him.
      if(payload.roles.includes(roleConstants.THERAPIST_ROLE) && !payload.roles.includes(roleConstants.TUTOR_ROLE)) {
        // Find the therapist
        const therapistResponse = await TutorTherapist.findOne({
          where: {
            userId: payload.id
          },
          include: [
            {
              model: User,
              include: [
                {
                  model: UserRoles,
                  where: {
                    roleId: 3
                  }
                }
              ]
            }
          ]
        });

        if(!therapistResponse) {
          return {
            error: true,
            statusCode: 404,
            message: messages.therapist.errors.not_found
          }
        }

        whereCondition = {
          ...whereCondition,
          therapistId: therapistResponse.id
        }
      }

      // Validate if the user logged is Tutor, if this true, we validate searching just patients assigned to him.
      if(payload.roles.includes(roleConstants.TUTOR_ROLE) && !payload.roles.includes(roleConstants.THERAPIST_ROLE)) {
        // Find the tutor
        const tutorResponse = await TutorTherapist.findOne({
          where: {
            userId: payload.id
          },
          include: [
            {
              model: User,
              include: [
                {
                  model: UserRoles,
                  where: {
                    roleId: 5
                  }
                }
              ]
            }
          ]
        });

        if(!tutorResponse) {
          return {
            error: true,
            statusCode: 404,
            message: messages.tutor.errors.not_found
          }
        }

        whereCondition = {
          ...whereCondition,
          tutorId: tutorResponse.id
        }
      }

      if(payload.roles.includes(roleConstants.THERAPIST_ROLE) && payload.roles.includes(roleConstants.TUTOR_ROLE)) {
        // Find the tutor
        const tutorTherapistResponse = await TutorTherapist.findOne({
          where: {
            userId: payload.id
          },
          include: [
            {
              model: User,
              include: [
                {
                  model: UserRoles,
                  where: {
                    [Op.or]: [
                      {
                        roleId: 3
                      },
                      {
                        roleId: 5,
                      }
                    ]
                  }
                }
              ]
            }
          ]
        });

        if(!tutorTherapistResponse) {
          return {
            error: true,
            statusCode: 404,
            message: messages.therapist.errors.not_found
          }
        }

        whereCondition = {
          ...whereCondition,
          [Op.or]: [
            {
              tutorId: tutorTherapistResponse.id
            },
            {
              therapistId: tutorTherapistResponse.id
            }
          ]
        }
      }

      const data = await Patient.findOne({
        where: whereCondition,
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
              exclude: ['updatedAt']
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
            model: HealthRecord,
            attributes: {
              exclude: ['createdAt','updatedAt','status','patientId']
            },
            include: [
              {
                model: AchievementsHealthRecord,
                include: {
                  model: Achievement,
                  attributes: ['id', 'name', 'imageUrl']
                }
              },
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
              },
            ],
          }
        ],
        order:[
          [{model: PatientActivity}, 'createdAt', 'DESC'],
        ]
      });


      if(!data) {
        return {
          error: true,
          statusCode: 404,
          message: messages.patient.errors.not_found,
        }
      };

      const { error, data:pictogramData } = await getCustomPictograms({ patientResponse: data });
      if(!error) {
        data.pictograms = pictogramData;
      }

      // Get Progress of the Patient about his phase level and activities score
      const { error:progressError, message: progressMessage, generalProgress, phaseProgress } = await getProgress(data.id);
      if(progressError) {
        return {
          error: progressError,
          statusCode: 409,
          message: progressMessage,
        }
      }
      // Adding keys to patient response
      data.generalProgress = generalProgress;
      data.phaseProgress = phaseProgress;

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
            where: {
              status: true,
            },
            include: [
              {
                model: UserRoles,
                where: {
                  roleId: 5,
                },
                include: {
                  model: Role,
                  where: {
                    name: roleConstants.TUTOR_ROLE,
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
              where: {
                status: true,
              },
              include: [
                {
                  model: UserRoles,
                  where: {
                    roleId: 3,
                  },
                  include: {
                    model: Role,
                    where: {
                      name: roleConstants.THERAPIST_ROLE,
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
                model: AchievementsHealthRecord,
                include: {
                  model: Achievement,
                  attributes: ['id', 'name', 'imageUrl']
                }
              },
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

  async update(id,body, payload) {
    const transaction = await sequelize.transaction();
    try {

      // Variables
      let whereCondition = {
        id,
        status: true,
      }

      if(payload.roles.includes(roleConstants.TUTOR_ROLE)) {
        const tutorExist = await TutorTherapist.findOne({
          where:{
            userId: payload.id
          },
          include: [
            {
              model: User,
              where: {
                status: true,
              },
              include: [
                {
                  model: UserRoles,
                  where: {
                    roleId: 5
                  },
                },
              ]
            },
          ]
        });

        if(!tutorExist) {
          return {
            error: true,
            statusCode: 401,
            message: messages.generalMessages.bad_request,
            validationErrors: formatErrorMessages('tutor', messages.auth.errors.unauthorized),
          }
        }
        // add tutorId to patient request
        whereCondition = {
          ...whereCondition,
          tutorId: tutorExist.id
        }
      }

      // validate if patient exist
      const patientExist = await Patient.findOne({
        where: whereCondition,
        include: [
          {
            model: User,
            where: {
              status: true,
            }
          }
        ]
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
      const { tutorId, ...resData } = body;

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

      if(payload.roles.some(name => name === roleConstants.SUPERADMIN_ROLE || name === roleConstants.ADMIN_ROLE)) {
        // Tutor Exist validation
        if(tutorId) {
          const tutorExist = await TutorTherapist.findOne({
            where: {
              id: tutorId,
              status: true
            },
            include: [
              {
                model: User,
                where: {
                  status: true,
                },
                include: [
                  {
                    model: UserRoles,
                    where: {
                      roleId: 5
                    }
                  },
                ]
              },
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

          // Update patient adding the new tutor.
          const patientResponse = await Patient.update({
            tutorId
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

  async changeTherapist({patientId, therapistId}) {
    const transaction = await sequelize.transaction();
    try {

      // Find the therapist
      const therapistResponse = await TutorTherapist.findOne({
        where: {
          id: therapistId,
          status: true,
        },
        include: [
          {
            model: User,
            where: {
              userVerified: true,
              status: true,
            },
            include: [
              {
                model: UserRoles,
                where: {
                  roleId: 3
                }
              }
            ]
          }
        ]
      });

      if(!therapistResponse) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.therapist.errors.not_found
        }
      }

      // Verify if patient Exist
      const patientExist = await Patient.findOne({
        where: {
          id: patientId,
          status: true,
        },
        include: {
          model: User,
          where: {
            status: true,
          }
        }
      });
      if(!patientExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.patient.errors.not_found
        }
      }

      // Validate the new therapist does not be the same therapist currently assigned to patient
      if(patientExist.therapistId === therapistId) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.patient.errors.service.therapist_assigned
        }
      }

      // validate if patient does not have therapist.
      if(!patientExist.therapistId || patientExist.therapistId === null) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.patient.errors.service.unassigned_therapist
        }
      }


      // update patient changing the therapistId
      const data = await Patient.update({
        therapistId
      }, {
        where: {
          id: patientId,
          status: true,
        },
        transaction
      });

      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.patient.errors.service.change_therapist
        }
      }

      // Commit transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.patient.success.change_therapist
      }

    } catch(error) {
      await transaction.rollback();
      logger.error(`${messages.patient.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  }

}
