const logger = require('@config/logger.config');
const { Op } = require('sequelize');
const { TutorTherapist, Person, User, Role, Permission, UserRoles, Patient ,sequelize } = require('@models/index.js');
const { pagination, userPerson, messages, dates, dataStructure } = require('../utils/index');
const { 
  deleteUser
} = require('./user.service');

module.exports = {

  /**
   * The function `all` retrieves paginated data of therapists with related person, user, role, and
   * permission information while handling errors gracefully.
   * @param query - The `all` function you provided is an asynchronous function that retrieves data
   * from the database using pagination and includes related models. The function handles errors and
   * logs them using a logger.
   * @returns The `all` function returns an object with the following properties:
   * - `error`: A boolean value indicating if an error occurred (false if no error, true if there was
   * an error).
   * - Other properties include the paginated data from the database query, such as `count`, `rows`,
   * and pagination information like `page` and `totalPages`.
   */
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
                exclude: ['createdAt','updatedAt','status','password']
              },
              include: [
                {
                  model: UserRoles,
                  where: {
                    roleId: 3,
                    /* userId: {
                      [Op.col]: 'User.id'
                    } */
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
              as: 'therapist',
              attributes: {
                exclude: ['createdAt','updatedAt','status']
              },
            }
          ],
        });

        return {
          error: false,
          message: messages.therapist.success.all,
          data: dataStructure.therapistDataStructure(data),
        }
      }
      // Pagination
      const { limit, offset } = pagination.paginationValidation(query.page, query.size);


      const data = await TutorTherapist.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: {
          status: true
        },
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
              exclude: ['createdAt','updatedAt','status','password']
            },
            include: [
              {
                model: UserRoles,
                where: {
                  roleId: 3,
                  /* userId: {
                    [Op.col]: 'User.id'
                  } */
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
            as: 'therapist',
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
          }
        ],
      });

      // Add therapist's age
      data.rows = dataStructure.therapistDataStructure(data.rows);// dates.getAllAges(data.rows); // getAllAges method is just for get the age from the birthday

      const dataResponse = pagination.getPageData(data, query.page, limit);

      return {
        error: false,
        message: messages.therapist.success.all,
        ...dataResponse
      }

    } catch (error) {
      logger.error(`${messages.therapist.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: `${messages.therapist.errors.service.base}: ${error}`,
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
          id
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
                            'permissionId',
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            ]
          },
          {
            model: Patient,
            as: 'therapist',
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
          }
        ]
      });

      if(!data) {
        return {
          error: true,
          message: messages.therapist.errors.not_found,
          statusCode: 404
        }
      };

      return {
        error: false,
        message: messages.therapist.success.found,
        data: dataStructure.findTherapistDataStructure(data)// dates.getAge(data) // getAge method is just for get the age from the birthday  
      };

    } catch (error) {
      logger.error(`${messages.therapist.errors.service.base}: ${error}`);
      return {
        error: true,
        message: `${messages.therapist.errors.service.base}: ${error}`,
        statusCode: 500
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
  async create(body) {
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
          message: messages.therapist.errors.in_use.identificationNumber,
          statusCode: 400
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
          message: messages.therapist.errors.in_use.phoneNumber,
          statusCode: 400
        };
      };
      /* eslint-disable no-restricted-syntax */
      /* eslint-disable no-await-in-loop */
      for (const iterator of resBody.roles) {
        if(iterator !== 3){
          await transaction.rollback();
          return {
            error: true,
            message: messages.therapist.errors.service.not_role,
            statusCode: 400
          }
        }
      }

      // User and Person creation
      const { error:userPersonError, statusCode, message = messages.therapist.errors.service.create, data  } = await userPerson.createUserPerson(resBody,transaction);
      if(userPersonError) {
        await transaction.rollback();
        return {
          error: userPersonError,
          message,
          statusCode
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
          message: messages.therapist.errors.service.create,
          statusCode: 400
        };
      };

      // commit transaction
      await transaction.commit();

      // find Therapist
      const newData = await TutorTherapist.findOne({
        where: {
          id: therapistData.id
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','userId','personId']
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
                            'permissionId',
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
        message: messages.therapist.success.create,
        data: dates.getAge(newData), // newData
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.therapist.errors.service.base}: ${error}`);
      return {
        error: true,
        message: `${messages.therapist.errors.service.base}: ${error}`,
        statusCode: 500
      }
    }
  },

  /**
   * The function `update` in JavaScript updates therapist information in a database transaction,
   * handling validations and returning the updated data or error messages.
   * @param id - The `id` parameter in the `update` function is used to identify the therapist that
   * needs to be updated. It is typically a unique identifier for the therapist in the database, such
   * as a numeric ID or a UUID. This ID is used to locate the specific therapist record that requires
   * updating in the
   * @param body - The `update` function you provided is responsible for updating therapist information
   * in a database transaction. It first validates if the therapist exists, then updates the
   * therapist's personal information, user information, and therapist-specific information.
   * @returns The `update` method returns an object with the following properties:
   * - `error`: A boolean indicating if an error occurred during the update process.
   * - `message`: A message describing the outcome of the update operation.
   * - `data`: If the update was successful, it includes the updated data of the therapist.
   * - `statusCode`: An HTTP status code indicating the result of the update operation.
   */
  async update(id,body) {
    const transaction = await sequelize.transaction();
    try {

      // validate if therapist exist
      const therapistExist = await TutorTherapist.findOne({
        where: {
          id,
          status: true
        },
        include: [
          {
            model: User,
            where: {
              status: true
            },
            include: {
              model: UserRoles,
              where: {
                roleId: 3,
                userId: {
                  [Op.col]: 'User.id'
                }
              }
            }
          }
        ]
      });
      if(!therapistExist) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.therapist.errors.not_found,
          statusCode: 404
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
              [Op.ne]: id
            }
          }
        });
        if(identificationNumberExist) {
          await transaction.rollback();
          return {
            error: true,
            message: messages.therapist.errors.in_use.identificationNumber,
            statusCode: 400
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
              [Op.ne]: id
            }
          }
        });
        if(phoneNumberExist) {
          await transaction.rollback();
          return {
            error: true,
            message: messages.therapist.errors.in_use.phoneNumber,
            statusCode: 400
          };
        };
      };

      // User and Person update
      if(resBody) {
        const { error:userPersonError, statusCode, message=messages.therapist.errors.service.update  } = await userPerson.updateUserPerson({
          ...resBody,
          personId: therapistExist.personId,
          userId: therapistExist.userId
        }, transaction);
        if(userPersonError) {
          await transaction.rollback();
          return {
            error: userPersonError,
            message,
            statusCode
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
              id
            },
            transaction
          }
        );
        if(!updateTherapistResponse) {
          await transaction.rollback();
          return {
            error: true,
            message: messages.therapist.errors.service.update,
            statusCode: 400
          };
        };
      }

      // commit changes
      await transaction.commit();

      // Get Therapist data
      const data = await TutorTherapist.findOne({
        where: {id},
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
                            'permissionId',
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
        message: messages.therapist.success.update,
        data: dates.getAge(data) // getAge method is just for get the age from the birthday
      };
    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.therapist.errors.service.base}: ${error}`);
      return {
        error: true,
        message: `${messages.therapist.errors.service.base}: ${error}`,
        statusCode: 500
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
        }
      });
      if(!therapistExist) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.therapist.errors.not_found,
          statusCode: 404
        }
      };

      // update User
      const { error:userError, statusCode } = await deleteUser(therapistExist.userId, transaction);
      if(userError) {
        await transaction.rollback();
        return {
          error: userError,
          message: messages.therapist.errors.service.delete,
          statusCode
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
          message: messages.therapist.errors.service.delete,
          statusCode: 400
        };
      };

      // commit transaction
      await transaction.commit();

      return {
        error: false,
        message: messages.therapist.success.delete,
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.therapist.errors.service.base}: ${error}`);
      return {
        error: true,
        message: `${messages.therapist.errors.service.base}: ${error}`,
        statusCode: 500
      }
    }
  }
}

