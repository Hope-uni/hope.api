const logger = require('@config/logger.config');
const { Op } = require('sequelize');
const { Therapist, Person, User, Role, Permission ,sequelize } = require('@models/index.js');
const { paginationValidation, getPageData } = require('@utils/pagination.util');
const { 
  createUserPerson,
  updateUserPerson,
} = require('@utils/user-person.util');
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
  async all(query) {
    try {
      // Pagination
      const { limit, offset } = paginationValidation(query.page, query.size);


      const data = await Therapist.findAndCountAll({
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
              exclude: ['createdAt','updatedAt']
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
        message: 'Lista de Terapeutas',
        ...dataResponse
      }

    } catch (error) {
      logger.error(`There was an error in Therapiist services: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: `There was an error in Therapist services: ${error}`,
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
      
      const data = await Therapist.findOne({
        where: {
          id
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        },
        include: [
          {
            model: Person,
            attributes: {
              exclude: ['createdAt','updatedAt']
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
          message: 'Terapeuta no encontrado',
          statusCode: 404
        }
      };

      return {
        error: false,
        message: 'Terapeuta encontrado',
        data  
      };

    } catch (error) {
      logger.error(`There was an error in Therapiist services: ${error}`);
      return {
        error: true,
        message: `There was an error in Therapist services: ${error}`,
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
      const identificationNumberExist = await Therapist.findOne({
        where: {
          identificationNumber,
          status: true
        }
      });
      if(identificationNumberExist) {
        await transaction.rollback();
        return {
          error: true,
          message: 'El número de identificación ya está en uso',
          statusCode: 400
        };
      };

      // Phone number validation
      const phoneNumberExist = await Therapist.findOne({
        where: {
          phoneNumber,
          status: true
        }
      });
      if(phoneNumberExist) {
        await transaction.rollback();
        return {
          error: true,
          message: 'El número de teléfono ya está en uso',
          statusCode: 400
        };
      };

      // User and Person creation
      const { error:userPersonError, statusCode, message, data  } = await createUserPerson(resBody);
      if(userPersonError) {
        await transaction.rollback();
        return {
          error: userPersonError,
          message,
          statusCode
        };
      };

      const therapistData = await Therapist.create({
        identificationNumber,
        phoneNumber,
        idPerson: data.idPerson,
        idUser: data.idUser
      },{transaction});
      if(!therapistData) {
        await transaction.rollback();
        return {
          error: true,
          message: 'Terapeuta no creado',
          statusCode: 400
        };
      };

      // commit transaction
      await transaction.commit();

      // find Therapist
      const newData = await Therapist.findOne({
        where: {
          id: therapistData.id,
          status: true
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        },
        include: [
          {
            model: Person,
            attributes: {
              exclude: ['createdAt','updatedAt']
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
        message: 'Terapeuta creado',
        data: newData
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in Therapiist services: ${error}`);
      return {
        error: true,
        message: `There was an error in Therapist services: ${error}`,
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
      const therapistExist = await Therapist.findOne({
        where: {
          id,
          status: true
        }
      });
      if(!therapistExist) {
        await transaction.rollback();
        return {
          error: true,
          message: 'Terapeuta no encontrado',
          statusCode: 404
        }
      };

      // destructuring Object
      const {
        identificationNumber,
        phoneNumber,
        ...resBody
      } = body;

      // validate if user and person is correct
      if(therapistExist.idUser !== resBody.idUser || therapistExist.idPerson !== resBody.idPerson) {
        await transaction.rollback();
        return {
          error: true,
          message: 'Identificador de usuario o identificador de persona no son correctos',
          statusCode: 400
        };
      }

      // identification number validation
      if(identificationNumber) {
        const identificationNumberExist = await Therapist.findOne({
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
            message: 'El número de identificación ya está en uso',
            statusCode: 400
          };
        };
      };

      // phone number validation
      if(phoneNumber) {
        const phoneNumberExist = await Therapist.findOne({
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
            message: 'El número de teléfono ya está en uso',
            statusCode: 400
          };
        };
      };

      // User and Person update
      const { error:userPersonError, statusCode, message = 'Terapeuta no actualizado'  } = await updateUserPerson(resBody, transaction);
      if(userPersonError) {
        await transaction.rollback();
        return {
          error: userPersonError,
          message,
          statusCode
        };
      };

      // Update Therapist
      const updateTherapistResponse = await Therapist.update(
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
          message: 'Terapeuta no actualizado',
          statusCode: 400
        };
      };

      // commit changes
      await transaction.commit();

      // Get Therapist data
      const data = await Therapist.findOne({
        where: {id},
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        },
        include: [
          {
            model: Person,
            attributes: {
              exclude: ['createdAt','updatedAt']
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
        message: 'Terapeuta actualizado',
        data
      };
    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in Therapiist services: ${error}`);
      return {
        error: true,
        message: `There was an error in Therapist services: ${error}`,
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
      const therapistExist = await Therapist.findOne({
        where: {
          id,
          status: true
        }
      });
      if(!therapistExist) {
        await transaction.rollback();
        return {
          error: true,
          message: 'Terapeuta no encontrado',
          statusCode: 404
        }
      };

      // update User
      const { error:userError, statusCode } = await deleteUser(therapistExist.idUser, transaction);
      if(userError) {
        await transaction.rollback();
        return {
          error: userError,
          message: 'Terapeuta no fue eliminado',
          statusCode
        }
      };

      // update transaction
      const updateTherapistResponse = await Therapist.update(
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
          message: 'Terapeuta no fue eliminado',
          statusCode: 400
        };
      };

      // commit transaction
      await transaction.commit();

      return {
        error: false,
        message: 'Terapeuta eliminado',
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in Therapiist services: ${error}`);
      return {
        error: true,
        message: `There was an error in Therapist services: ${error}`,
        statusCode: 500
      }
    }
  }
}

