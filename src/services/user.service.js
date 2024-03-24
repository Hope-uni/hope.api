const { User, Role,Permission } = require('@models/index.js');
const bcrypt = require('bcrypt');
const logger = require('@config/logger.config');
const { Op } = require('sequelize');
const { paginationValidation, getPageData } = require('@utils/pagination.util');


module.exports = {


  /**
   * The function `allUsers` retrieves a paginated list of users with their associated roles, excluding
   * certain attributes, and handles errors appropriately.
   * @param query - The `allUsers` function you provided is an asynchronous function that retrieves a
   * list of users with pagination and some filtering criteria. Here's a breakdown of the function:
   * @returns The `allUsers` function returns an object with different properties based on the outcome
   * of the database query and pagination.
   */
  async allUsers(query) {
    try {

      // Pagination
      const { limit, offset } = paginationValidation(query.page,query.size);
      
      const data = await User.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: {
          id: {
            [Op.ne]: 1
          },
          status: true
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status', 'password'],
        },
        include: [
          {
            model: Role,
            attributes: {
              exclude: ['createdAt','updatedAt', 'status']
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
      });

      const dataResponse = getPageData(data, query.page, limit);

      return {
        error: false,
        message: 'Lista de Usuarios',
        ...dataResponse
      };

    } catch (error) {
      logger.error(error);
      return {
        message: `There was an error in User services: ${error}`,
        error: true,
        statusCode: 500
      }
    }
  },


  /**
   * The function `findUser` searches for a user by ID in a database and returns the user data if
   * found, or an error message if not found or if an error occurs.
   * @param id - The `id` parameter is used to find a user in the database. The function first checks
   * if the `id` is equal to 1 and returns an error message if it matches. Otherwise, it tries to find
   * a user with the provided `id` that has a status of true in the
   * @returns The `findUser` function returns an object with different properties based on the
   * conditions met during its execution. Here are the possible return values:
   */
  async findUser(id) {
    try {
      
      if(+id === 1) {
        return {
          message: `Usuario no encontrado`,
          error: true,
          statusCode: 404
        }
      }

      const data = await User.findOne({
        where: {
          id,
          status: true
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','password'],
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
      });

      if(!data) {
        return {
          message: `Usuario no encontrado`,
          error: true,
          statusCode: 404,
        }
      };

      return {
        error: false,
        message: 'Usuario encontrado',
        data
      };

    } catch (error) {
      logger.error(error);
      return {
        message: `There was an error in User services: ${error}`,
        error: true,
        statusCode: 500
      }
    }
  },

  /**
   * The function `createUser` in JavaScript creates a new user with validations for username, email,
   * role, and password hashing, and returns the created user data or error messages.
   * @param body - The `createUser` function you provided is an asynchronous function that creates a
   * new user in a database using Sequelize ORM. It performs various validations before creating the
   * user and handles errors using transactions.
   * @param ts => transaction param. this will be use it when you create therapist, tutor or patient register
   * @returns The function `createUser` returns an object with different properties based on the
   * outcome of the user creation process. Here are the possible return values:
   */
  async createUser(body,transaction) {
    try {
      // username Validation
      const usernameExist = await User.findOne({
        where: {
          username: body.username,
          status: true,
        }
      });
      if(usernameExist) {
        return {
          message: `Nombre de Usuario está en uso`,
          error: true,
          statusCode: 400
        }
      };
      // Email Validation
      const emailExist = await User.findOne({
        where: {
          email: body.email,
          status: true,
        }
      });
      if(emailExist) {
        return {
          message: `Correo está en uso`,
          error: true,
          statusCode: 400
        }
      };

      // Role Validation
      const roleExist = await Role.findOne({
        where: {
          id: body.roleId,
          status: true
        }
      });
      if(!roleExist) {
        return {
          message: `Rol no encontrado`,
          error: true,
          statusCode: 404
        }
      };

      // Hash Password Validation
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(body.password, salt);
      
      // Create User
      const data = await User.create(
        {
          ...body,
          password: hashedPassword
        }, 
        {
          transaction 
        }
      );

      if(!data) {
        return {
          error: true,
          message: `Usuario no creado`,
          statusCode: 400
        }
      };

      return {
        error: false,
        message: 'Usuario creado',
        data
      };
    } catch (error) {
      logger.error(`There was an error in User services: ${error}`);
      return {
        message: `There was an error in User services: ${error}`,
        error: true,
        statusCode: 500
      }
    }
  },

  /**
   * The function `updateUser` updates a user in a database with validations for username, email, and
   * roleId, and returns appropriate messages and data based on the outcome.
   * @param id - The `id` parameter in the `updateUser` function represents the unique identifier of
   * the user whose information is being updated. This identifier is used to locate the specific user
   * record in the database that needs to be updated.
   * @param ts => transaction param. this will be use it when you update therapist, tutor or patient register
   * @param body - The `body` parameter in the `updateUser` function contains the data that needs to be
   * updated for a user. It can include fields like `username`, `email`, `roleId`, etc. The function
   * first checks if the user with the specified `id` exists in the database. Then it
   * @returns The function `updateUser` returns an object with the following properties:
   * - `error`: A boolean indicating if an error occurred or not.
   * - `message`: A message describing the result of the operation.
   * - `data`: The updated user data if the operation was successful.
   * - `statusCode`: The status code of the response.
   */
  async updateUser(id, body, transaction) {
    try {

      // User Exist
      const userExist = await User.findOne({
        where: {
          [Op.and]: [
            {
              id
            },
            {
              id: {
                [Op.ne]: 1
              }
            }
          ],
          status: true,

        }
      });
      if(!userExist) {
        return {
          message: `Usuario no encontrado`,
          error: true,
          statusCode: 404
        }
      };
      
      // Username Validation
      if(body.username) {
        const usernameExist = await User.findOne({
          where: {
            username: body.username,
            status: true,
            id: {
              [Op.ne]: id
            }
          }
        });
        if(usernameExist) {
          return {
            message: `Nombre de Usuario está en uso`,
            error: true,
            statusCode: 400
          }
        };
      };

      // Email Validation
      if(body.email) {
        const emailExist = await User.findOne({
          where: {
            email: body.email,
            status: true,
            id: {
              [Op.ne]: id
            }
          }
        });
        if(emailExist) {
          return {
            message: `Correo está en uso`,
            error: true,
            statusCode: 400
          }
        };
      };

      // RoleId Validatrion
      if(body.roleId) {
        const roleExist = await Role.findOne({
          where: {
            id: body.roleId,
            status: true
          }
        });
        if(!roleExist) {
          return {
            message: `Rol no encontrado`,
            error: true,
            statusCode: 404
          }
        };
      };

      const data = await User.update(body, {
        where: {
          id
        },
        returning: true,
        transaction
      });

      if(!data) {
        return {
          error: true,
          message: `Usuario no actualizado`,
          statusCode: 400
        }
      };

      return {
        error: false,
        message: 'Usuario actualizado',
        data
      };

    } catch (error) {
      logger.error(error);
      return {
        message: `There was an error in User services: ${error}`,
        error: true,
        statusCode: 500
      }
    }
  },


  /**
   * This function deletes a user from a database using Sequelize transactions and handles various
   * error scenarios.
   * @param id - The `id` parameter in the `deleteUser` function represents the unique identifier of
   * the user that you want to delete from the database. This identifier is used to locate the specific
   * user record that needs to be marked as deleted by setting its `status` field to `false`.
   * @param ts => transaction param. this will be use it when you delete therapist, tutor or patient register
   * @returns The `deleteUser` function returns an object with different properties based on the
   * outcome of the operation. Here are the possible return values:
   */
  async deleteUser(id, transaction) {
    try {
      
      // User Exist
      const userExist = await User.findOne({
        where: {
          id
        }
      });
      if(!userExist) {
        return {
          message: `Usuario no encontrado`,
          error: true,
          statusCode: 404
        }
      };

      const data = await User.update(
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

      if (!data) {
        return {
          message: `Usuario no fue eliminado`,
          error: true,
          statusCode: 400
        };
      };

      return {
        error: false,
        message: 'Usuario eliminado',
      }

    } catch (error) {
      logger.error(error);
      return {
        message: `There was an error in User services: ${error}`,
        error: true,
        statusCode: 500
      }
    }
  }
}