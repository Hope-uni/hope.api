const { Op } = require('sequelize');
const logger = require('@config/logger.config');
const { roleConstants } = require('@constants');
const {
  TutorTherapist,
  User,
  Person,
  Role,
  UserRoles,
  Patient,
  HealthRecord,
  TeaDegree,
  Phase,
  Observation,
  Achievement,
  AchievementsHealthRecord,
  sequelize
} = require('@models/index.js');
const { pagination, messages, dataStructure, formatErrorMessages, generatePassword } = require('@utils/index');
const { userSendEmail } = require('@helpers/index');
const {
  deleteUser,
  createUser,
  updateUser,
} = require('./user.service');

module.exports = {
  /* eslint-disable radix */
  /* eslint-disable consistent-return */
  /* eslint-disable no-restricted-syntax */
  /* eslint-disable no-plusplus */
  async all(query) {
    try {

      if(!query.page || !query.size || parseInt(query.page) === 0 && parseInt(query.size) === 0) {
        const data = await TutorTherapist.findAll({
          where: {
            status: true
          },
          order:[['createdAt', 'ASC']],
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
              where: {
                status: true,
              },
              attributes: {
                exclude: ['createdAt','updatedAt','status','password']
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
                },
              ]
            },
            {
              model: Patient,
              as: 'patientTutor',
              attributes: {
                exclude: ['createdAt','updatedAt','status']
              },
              include: [
                {
                  model: Person
                },
                {
                  model: User
                }
              ]
            }
          ]
        });

        return {
          error: false,
          statusCode: 200,
          message: messages.tutor.success.all,
          data: dataStructure.tutorDataStructure(data),
        }
      }

      // Pagination
      const { limit, offset } = pagination.paginationValidation(query.page, query.size);

      const data = await TutorTherapist.findAndCountAll({
        limit,
        offset,
        distinct: true,
        order:[['createdAt','ASC']],
        where: {
          status: true
        },
        attributes: {
          exclude: ['updatedAt','status', 'personId']
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
            where: {
              status: true,
            },
            attributes: {
              exclude: ['createdAt','updatedAt','status','password']
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
              },
            ]
          },
          {
            model: Patient,
            as: 'patientTutor',
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: [
              {
                model: Person
              },
              {
                model: User
              }
            ]
          }
        ]
      });

      // Get Tutor Structure
      data.rows = dataStructure.tutorDataStructure(data.rows);

      const dataResponse = pagination.getPageData(data, query.page, limit);

      return {
        error: false,
        statusCode: 200,
        message: messages.tutor.success.all,
        ...dataResponse
      }

    } catch (error) {
      logger.error(`${messages.tutor.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },


  async allPatientsTutor(query, payload) {
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

        if(!tutorExist || tutorExist.User.UserRoles[0].name === roleConstants.TUTOR_ROLE) {
          return {
            error: true,
            statusCode: 404,
            message: messages.tutor.errors.not_found,
          }
        }


        if(!query.page || !query.size || parseInt(query.page) === 0 && parseInt(query.size) === 0) {
          const data = await Patient.findAll({
            where: {
              status: true,
              tutorId: tutorExist.id,
            },
            order:[['createdAt', 'ASC']],
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
                where: {
                  status: true,
                  userVerified: true,
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
          order:[['createdAt', 'ASC']],
          where: {
            status: true,
            tutorId: tutorExist.id,
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
              where: {
                status: true,
                userVerified: true,
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
        logger.error(`${messages.tutor.errors.service.base}: ${error}`);
        return {
          error: true,
          statusCode: 500,
          message: messages.generalMessages.server,
        }
      }
  },

  async findOne(id) {
    try {

      const data = await TutorTherapist.findOne({
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
            model: User,
            where: {
              status: true,
            },
            attributes: {
              exclude: ['createdAt','updatedAt','status','password']
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
              },
            ]
          },
          {
            model: Patient,
            as: 'patientTutor',
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: [
              {
                model: Person
              },
              {
                model: User
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
          }
        ]
      });

      if(!data) {
        return {
          error: true,
          statusCode: 404,
          message: messages.tutor.errors.not_found,
        }
      };

      return {
        error: false,
        statusCode: 200,
        message: messages.tutor.success.found,
        data: dataStructure.findTutorDataStructure(data),
      }

    } catch (error) {
      logger.error(`${messages.tutor.errors.service.base}: ${error}`);
      return {
        error: true,
        message: `${messages.tutor.errors.service.base}: ${error}`,
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
      const identificationNumberExist = await TutorTherapist.findOne({
        where: {
          identificationNumber,
          status: true
        }
      });
      if(identificationNumberExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('identificationNumber', messages.therapist.errors.in_use.identificationNumber),
        };
      };

      // Phone number validation
      const phoneNumberExist = await TutorTherapist.findOne({
        where: {
          phoneNumber,
          status: true
        }
      });
      if(phoneNumberExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('phoneNumber', messages.tutor.errors.in_use.phoneNumber),
        };
      };

      // Telephone validation
      if(telephone) {
        const telephoneExist = await TutorTherapist.findOne({
          where: {
            telephone,
            status: true
          }
        });
        if(telephoneExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('telephone', messages.tutor.errors.in_use.phoneNumber),
          };
        };
      }

      // Assigning Roles and generate the temporary password.
      const passwordTemp = generatePassword(); // generate the temporary password using uuid and get the first 8 characters
      resBody.password = passwordTemp;
      resBody.roles = [5];

      // Validate and create User and Person
      const { error:userPersonError, message, statusCode, validationErrors, data } = await createUser(resBody, transaction);
      if(userPersonError) {
        await transaction.rollback();
        return {
          error: userPersonError,
          message,
          statusCode,
          validationErrors,
        };
      }

      // create Tutor
      const tutorResponse = await TutorTherapist.create({
        identificationNumber,
        phoneNumber,
        telephone,
        personId: data.personId,
        userId: data.userId,
      },{transaction});
      if(!tutorResponse) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('create', messages.tutor.errors.service.create),
        };
      };

      // Send email with the temporary password to the therapist
      const { error: emailError, message: emailMessage } = await userSendEmail({
        email: resBody.email,
        password: passwordTemp,
        username: resBody.username,
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

      // find Tutor
      const newData = await TutorTherapist.findOne({
        where: {
          id:tutorResponse.id,
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
            model: User,
            where: {
              status: true,
            },
            attributes: {
              exclude: ['createdAt','updatedAt','status','password']
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
              },
            ]
          },
          {
            model: Patient,
            as: 'patientTutor',
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: [
              {
                model: Person
              },
              {
                model: User
              }
            ]
          }
        ]
      });

      return {
        error: false,
        statusCode: 201,
        message: messages.tutor.success.create,
        data: dataStructure.tutorDataStructure(newData, true),
      };
    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.tutor.errors.service.base}: ${error}`);
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
      let tutorWhereCondition = {
        status: true,
      }

      if(payload.roles.includes(roleConstants.TUTOR_ROLE)) {
        tutorWhereCondition = {
          ...tutorWhereCondition,
          userId: payload.id
        }
      } else {
        tutorWhereCondition = {
          ...tutorWhereCondition,
          id,
        }
      }

      // validate if tutor exist
      const tutorExist = await TutorTherapist.findOne({
        where: tutorWhereCondition,
        include: [
          {
            model: User,
            where: {
              status: true
            },
            include: {
              model: UserRoles,
              where: {
                roleId: 5,
              }
            }
          }
        ]
      },{transaction});
      if(!tutorExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('tutor', messages.tutor.errors.not_found),
        }
      };

      // destructuring Object
      const {
        identificationNumber,
        phoneNumber,
        telephone,
        ...resData
      } = body;

      // identification number validation
      if(identificationNumber) {
        const identificationNumberExist = await TutorTherapist.findOne({
          where: {
            identificationNumber,
            status: true,
            id: {
              [Op.ne]: tutorExist.id
            }
          }
        });
        if(identificationNumberExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('identificationNumber', messages.therapist.errors.in_use.identificationNumber),
          };
        };
      }
      // phone number validation
      if(phoneNumber) {
        const phoneNumberExist = await TutorTherapist.findOne({
          where: {
            phoneNumber,
            status: true,
            id: {
              [Op.ne]: tutorExist.id
            }
          }
        });
        if(phoneNumberExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('phoneNumber', messages.tutor.errors.in_use.phoneNumber),
          };
        };
      }
      // telephone validation
      if(telephone) {
        const telephoneExist = await TutorTherapist.findOne({
          where: {
            telephone,
            status: true,
            id: {
              [Op.ne]: tutorExist.id
            }
          }
        });
        if(telephoneExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('telephone', messages.tutor.errors.in_use.phoneNumber),
          };
        };
      }

      // Validate and update User and Person
      if(resData) {
        const { error:userPersonError, statusCode, message, validationErrors } = await updateUser(tutorExist.userId,{
          ...resData,
          personId: tutorExist.personId
        }, transaction);
        if(userPersonError) {
          await transaction.rollback();
          return {
            error: userPersonError,
            statusCode,
            message,
            validationErrors,
          };
        };
      }


      // update transaction
      if(identificationNumber || phoneNumber || telephone) {
        const updateTutorResponse = await TutorTherapist.update(
          {
            identificationNumber,
            phoneNumber,
            telephone
          },
          {
            where: {
              id: tutorExist.id
            },
            transaction
          }
        );
        if(!updateTutorResponse) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('update', messages.tutor.errors.service.update),
          };
        };
      }

      // Commit Transaction
      await transaction.commit();

      // find Tutor
      const newData = await TutorTherapist.findOne({
        where: {
          id: tutorExist.id,
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
            model: User,
            where: {
              status: true,
            },
            attributes: {
              exclude: ['createdAt','updatedAt','status','password']
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
              },
            ]
          },
          {
            model: Patient,
            as: 'patientTutor',
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: [
              {
                model: Person
              },
              {
                model: User
              }
            ]
          }
        ]
      });



      return {
        error: false,
        statusCode: 200,
        message: messages.tutor.success.update,
        data: dataStructure.updateTutorDataStructure(newData),
      }
    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.tutor.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

  async removeTutor(id) {
    const transaction = await sequelize.transaction();
    try {
      // validate if tutor exist
      const tutorExist = await TutorTherapist.findOne({
        where: {
          id,
          status: true
        }
      });
      if(!tutorExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.tutor.errors.not_found
        }
      };

      // remove User
      const { error:userError, statusCode } = await deleteUser(tutorExist.userId, transaction);
      if(userError) {
        await transaction.rollback();
        return {
          error: userError,
          statusCode,
          message: messages.tutor.errors.service.delete,
        }
      };

      // update transaction
      const updateTutorResponse = await TutorTherapist.update(
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
          statusCode: 409,
          message: messages.tutor.errors.service.delete,
        };
      };

      // commit transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.tutor.success.delete,
      }
    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.tutor.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  }

}
