const { Op } = require('sequelize');
const { Patient, Person, TutorTherapist, User, UserRoles, Role, HealthRecord, TeaDegree, Phase, Observation } = require('@models/index');
const logger = require('@config/logger.config');
const { pagination, messages, dataStructure } = require('@utils/index');

/* eslint-disable radix */
module.exports = {

  async getPatients(query, payload) {
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

  async getPatientsTutor(query, payload) {
    try {

      // Get Tutor
      const tutorExist = await TutorTherapist.findOne({
        where: {
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
                  roleId: 5,
                },
                include: [
                  {
                    model: Role,
                    attributes: {
                      exclude: ['createdAt','updatedAt','status']
                    },
                  }
                ]
              }
            ]
          }
        ]
      });

      if(!tutorExist) {
        return {
          error: true,
          message: messages.tutor.errors.not_found,
          statusCode: 404
        }
      }

      
      if(!query.page || !query.size || parseInt(query.page) === 0 && parseInt(query.size) === 0) {
        const data = await Patient.findAll({
          where: {
            status: true,
            tutorId: tutorExist.id,
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
          tutorId: tutorExist.id,
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

  async getPatientsTherapist(query, payload) {
    try {
      // Get Tutor
      const therapistExist = await TutorTherapist.findOne({
        where: {
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
                  roleId: 3,
                },
                include: [
                  {
                    model: Role,
                    attributes: {
                      exclude: ['createdAt','updatedAt','status']
                    },
                  }
                ]
              }
            ]
          }
        ]
      });

      if(!therapistExist) {
        return {
          error: true,
          message: messages.therapist.errors.not_found,
          statusCode: 404
        }
      }

      
      if(!query.page || !query.size || parseInt(query.page) === 0 && parseInt(query.size) === 0) {
        const data = await Patient.findAll({
          where: {
            status: true,
            therapistId: therapistExist.id,
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
          tutorId: therapistExist.id,
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
  }

}