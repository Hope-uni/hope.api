const logger = require('@config/logger.config');
const { Op } = require('sequelize');
const {
  TutorTherapist,
  Person,
  User,
  Role,
  UserRoles,
  Patient,
  HealthRecord,
  TeaDegree,
  Phase,
  Observation,
  Activity,
  PatientActivity,
  Achievement,
  AchievementsHealthRecord,
  sequelize } = require('@models/index');
const { userSendEmail } = require('@helpers/index');
const { roleConstants } = require('@constants');
const { pagination, generatePassword, messages, dataStructure, formatErrorMessages, azureImages } = require('@utils');
const { userBlockContainer, defaultUserImage } = require('@config/variables.config');
const { deleteUser, createUser, updateUser } = require('./user.service');


module.exports = {

  /* eslint-disable radix */
  /* eslint-disable consistent-return */
  /* eslint-disable no-plusplus */
  async all(query) {
    try {

      if(!query.page || !query.size || parseInt(query.page) === 0 && parseInt(query.size) === 0) {
        const data = await TutorTherapist.findAll({
          where: {
            status: true,
          },
          order:[['createdAt', 'ASC']],
          attributes: {
            exclude: ['createdAt','updatedAt','status','personId']
          },
          include: [
            {
              model: Person,
              attributes: {
                exclude: ['createdAt','updatedAt','status','birthday']
              },
            },
            {
              model: User,
              where: {
                status: true,
              },
              attributes: {
                exclude: ['createdAt','updatedAt','password']
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
                },
              ]
            },
            {
              model: Patient,
              as: 'patientTherapist',
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
          ],
        });

        // validate if user status is true
        const newData = [];
        data.forEach((item) => {
          if(item.User.status === true) {
            newData.push(item);
          }
        });

        return {
          error: false,
          statusCode: 200,
          message: messages.therapist.success.all,
          data: dataStructure.therapistDataStructure(newData),
        }
      }
      // Pagination
      const { limit, offset } = pagination.paginationValidation(query.page, query.size);


      const data = await TutorTherapist.findAndCountAll({
        limit,
        offset,
        distinct: true,
        order:[['createdAt', 'ASC']],
        where: {
          status: true
        },
        attributes: {
          exclude: ['updatedAt','status','personId']
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
              },
            ]
          },
          {
            model: Patient,
            as: 'patientTherapist',
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
            ]
          }
        ],
      });

      // get Therapist structured
      data.rows = dataStructure.therapistDataStructure(data.rows);

      const dataResponse = pagination.getPageData(data, query.page, limit);

      return {
        error: false,
        statusCode: 200,
        message: messages.therapist.success.all,
        ...dataResponse
      }

    } catch (error) {
      logger.error(`${messages.therapist.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },



  async allPatientsTherapist(query, payload) {
    try {
      // Variable
      let conditinalInclude = [
        {
          model: Person,
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'status']
          },
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
          model: User,
          where: {
            status: true,
            userVerified: true,
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
        }
      ];

      // Get Therapist
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

      if(!therapistExist || therapistExist.User.UserRoles[0].name === roleConstants.THERAPIST_ROLE) {
        return {
          error: true,
          statusCode: 403,
          message: messages.generalMessages.forbidden
        }
      }


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
            therapistId: therapistExist.id,
          },
          order:[['createdAt', 'ASC']],
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

      // TODO: I need to check this part of the endpoint due to unknow issues
      const { limit, offset } = pagination.paginationValidation(query.page, query.size);

      const data = await Patient.findAndCountAll({
        limit,
        offset,
        distinct: true,
        order:[['createdAt', 'ASC']],
        where: {
          status: true,
          therapistId: therapistExist.id,
        },
        attributes: {
          exclude: ['updatedAt','status']
        },
        include: conditinalInclude
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


  /**
   * The function `findOne` retrieves a therapist's data based on their ID, excluding certain
   * attributes, and includes related data such as person details, user information, roles, and
   * permissions.
   * @param id - The `findOne` function you provided is an asynchronous function that retrieves a
   * therapist's data based on the `id` parameter. The function uses Sequelize ORM to query the
   * database and fetches the therapist's information along with related data such as Person, User,
   * Role, and Permission.
   * @returns The `findOne` function is returning an object with the following structure:
   * - If the therapist with the specified `id` is found:
   *   ```
   *   {
   *     error: false,
   *     message: 'Terapeuta encontrado',
   *     data: { therapistData }
   *   }
   *   ```
   *   - `error`: Indicates if there was an error (false in this case).
   *   - `message`: A success
   */
  async findOne(id) {
    try {

      const data = await TutorTherapist.findOne({
        where: {
          id,
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
              },
              {
                model: Activity,
                attributes: {
                  exclude: ['createdAt','updatedAt']
                },
                include: [
                  {
                    model: Phase,
                    attributes: {
                      exclude: ['createdAt','updatedAt','status']
                    },
                  }
                ]
              }
            ]
          },
          {
            model: Patient,
            as: 'patientTherapist',
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: [
              {
                model: Person
              },
              {
                model: User,
                where: {
                  status: true,
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
          },
        ],
      });

      if(!data) {
        return {
          error: true,
          statusCode: 404,
          message: messages.therapist.errors.not_found,
        }
      };

      return {
        error: false,
        statusCode: 200,
        message: messages.therapist.success.found,
        data: dataStructure.findTherapistDataStructure(data)
      };

    } catch (error) {
      logger.error(`${messages.therapist.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

  /**
  * The function creates a new therapist with associated user and person data, performing validations
  * and handling transactions.
  * @param body - {
  * @returns The `create` method is returning an object with the following properties:
  * - `error`: A boolean indicating if an error occurred during the process.
  * - `message`: A message describing the outcome of the operation.
  * - `data`: If no error occurred, this property contains the newly created therapist data.
  * - `statusCode`: An HTTP status code indicating the result of the operation.
  */
  async create(body, file) {
    const transaction = await sequelize.transaction();
    try {

        // destructuring Object
        const {
          identificationNumber,
          phoneNumber,
          ...resBody
        } = body;


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
          message: messages.generalMessages.base,
          statusCode: 409,
          validationErrors: formatErrorMessages('identificationNumber', messages.therapist.errors.in_use.identificationNumber)
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
          message: messages.generalMessages.base,
          statusCode: 409,
          validationErrors: formatErrorMessages('phoneNumber', messages.therapist.errors.in_use.phoneNumber)
        };
      };

      // Assigning Roles and generate the temporary password.
      const passwordTemp = generatePassword(); // generate the temporary password using uuid and get the first 8 characters
      resBody.password = passwordTemp;
      resBody.roles = [3];

      // User and Person creation
      const { error:userPersonError, statusCode, message, validationErrors, data  } = await createUser({...resBody,file},transaction);
      if(userPersonError) {
        await transaction.rollback();
        return {
          message,
          statusCode,
          error: userPersonError,
          validationErrors,
        };
      };

      const therapistData = await TutorTherapist.create({
        identificationNumber,
        phoneNumber,
        personId: data.personId,
        userId: data.userId
      },{transaction});
      if(!therapistData) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('create', messages.therapist.errors.service.create),
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

      // find Therapist
      const newData = await TutorTherapist.findOne({
        where: {
          id: therapistData.id
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
              },
            ]
          },
          {
            model: Patient,
            as: 'patientTherapist',
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: [
              {
                model: Person
              },
              {
                model: User,
                where: {
                  status: true,
                }
              }
            ]
          }
        ],
      });

      return {
        error: false,
        statusCode: 201,
        message: messages.therapist.success.create,
        data: dataStructure.therapistDataStructure(newData, true)
      }

    } catch (error) {
      logger.error(`${messages.therapist.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },


  async update(id,body, payload, file) {
    const transaction = await sequelize.transaction();
    try {

      // Variables
      let therapistWhereCondition = {
        status: true,
      }

      if(payload.roles.includes(roleConstants.THERAPIST_ROLE)) {
        therapistWhereCondition = {
          ...therapistWhereCondition,
          userId: payload.id
        }
      } else {
        therapistWhereCondition = {
          ...therapistWhereCondition,
          id,
        }
      }

      // validate if therapist exist
      const therapistExist = await TutorTherapist.findOne({
        where: therapistWhereCondition,
        include: [
          {
            model: User,
            where: {
              status: true,
            },
            include: {
              model: UserRoles,
              where: {
                roleId: 3,
              }
            }
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
        }
      };

      // destructuring Object
      const {
        identificationNumber,
        phoneNumber,
        ...resBody
      } = body;


      // identification number validation
      if(identificationNumber) {
        const identificationNumberExist = await TutorTherapist.findOne({
          where: {
            identificationNumber,
            status: true,
            id: {
              [Op.ne]: therapistExist.id
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
      };

      // phone number validation
      if(phoneNumber) {
        const phoneNumberExist = await TutorTherapist.findOne({
          where: {
            phoneNumber,
            status: true,
            id: {
              [Op.ne]: therapistExist.id
            }
          }
        });
        if(phoneNumberExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('phoneNumber', messages.therapist.errors.in_use.phoneNumber),
          };
        };
      };


      // User and Person update
      if(resBody) {
        const { error:userPersonError, statusCode, message, validationErrors  } = await updateUser(therapistExist.userId,{
          ...resBody,
          file,
          personId: therapistExist.personId,
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

      // Update Therapist
      if(identificationNumber || phoneNumber) {
        const updateTherapistResponse = await TutorTherapist.update(
          {
            identificationNumber,
            phoneNumber
          },
          {
            where: {
              id: therapistExist.id
            },
            transaction
          }
        );
        if(!updateTherapistResponse) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('update', messages.therapist.errors.service.update),
          };
        };
      }

      // commit changes
      await transaction.commit();

      // Get Therapist data
      const data = await TutorTherapist.findOne({
        where: {
          id: therapistExist.id
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
            where: {
              status: true,
            },
            attributes: {
              exclude: ['createdAt','updatedAt','password']
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
              },
            ]
          },
          {
            model: Patient,
            as: 'patientTherapist',
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
        ],
      });

      return {
        error: false,
        statusCode: 200,
        message: messages.therapist.success.update,
        data: dataStructure.updateTherapistDataStructure(data),
      };
    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.therapist.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

  /**
   * The function `removeTherapist` removes a therapist by updating their status and associated user
   * status in a transactional manner.
   * @param id - The `id` parameter in the `removeTherapist` function is used to identify the therapist
   * that needs to be removed from the system. It is expected to be the unique identifier of the
   * therapist record in the database that you want to delete.
   * @returns The `removeTherapist` function returns an object with properties based on the outcome of
   * the operation. Here is the breakdown of what is being returned:
   */
  async removeTherapist(id) {
    const transaction = await sequelize.transaction();
    try {

      // validate if therapist exist
      const therapistExist = await TutorTherapist.findOne({
        where: {
          id,
          status: true
        },
        include: {
          model: User,
          where: {
            status: true,
          },
          attributes: ['imageUrl']
        }
      });
      if(!therapistExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.therapist.errors.not_found,
        }
      };

      // update User
      const { error:userError, statusCode } = await deleteUser(therapistExist.userId, transaction);
      if(userError) {
        await transaction.rollback();
        return {
          error: userError,
          statusCode,
          message: messages.therapist.errors.service.delete,
        }
      };

      // update transaction
      const updateTherapistResponse = await TutorTherapist.update(
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
      if(!updateTherapistResponse) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.therapist.errors.service.delete,
        };
      };

      // delete the user image in the azure container
      if(therapistExist.User.imageUrl !== defaultUserImage) {
        const imageName = therapistExist.User.imageUrl.split('/').pop();
        const { error, statusCode:imageStatus, message } = await azureImages.deleteAzureImage(imageName, userBlockContainer);

        if(error) {
          await transaction.rollback();
          return {
            error,
            statusCode:imageStatus,
            message
          }
        }
      }

      // commit transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.therapist.success.delete,
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.therapist.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

}
