const { User, Role,Permission, UserRoles, sequelize } = require('@models/index.js');
const bcrypt = require('bcrypt');
const logger = require('@config/logger.config');
const { Op } = require('sequelize');
const { paginationValidation, getPageData } = require('@utils/pagination.util');
const messages = require('../utils/messages.utils');


module.exports = {


  /**
   * The function `allUsers` retrieves a paginated list of users with their associated roles, excluding
   * certain attributes, and handles errors appropriately.
   * @param query - The `allUsers` function you provided is an asynchronous function that retrieves a
   * list of users with pagination and some filtering criteria. Here's a breakdown of the function:
   * @returns The `allUsers` function returns an object with different properties based on the outcome
   * of the database query and pagination.
   */
  /* eslint-disable radix */
  /* eslint-disable consistent-return */
  async allUsers(query) {
    try {
      if(!query.page || !query.size || parseInt(query.page) === 0 && parseInt(query.size) === 0) {
        const data = await User.findAll({
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
        });

        return {
          error: false,
          message: messages.user.success.all,
          data,
        }
      }

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
      });

    const dataResponse = getPageData(data, query.page, limit);

      return {
        error: false,
        message: messages.user.success.all,
        ...dataResponse
      };

    } catch (error) {
      logger.error(`${messages.user.errors.service.base}: ${error}`);
      return {
        message: `${messages.user.errors.service.base}: ${error}`,
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
      
      if(parseInt(id) === 1) {
        return {
          message: messages.user.errors.not_found,
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
      });

      if(!data) {
        return {
          message: messages.user.errors.not_found,
          error: true,
          statusCode: 404,
        }
      };

      return {
        error: false,
        message: messages.user.success.found,
        data
      };

    } catch (error) {
      logger.error(error);
      return {
        message: `${messages.user.errors.service.base}: ${error}`,
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
  /* eslint-disable no-param-reassign */
  /* eslint-disable no-restricted-syntax */
  /* eslint-disable no-await-in-loop */
  async createUser(body,transaction) {
    try {

      // Destructuring data
      const { roles, ...resBody } = body;

      // this is when you try to create a user directly
      if(!transaction) {  
        transaction = await sequelize.transaction();
        // username Validation
        const usernameExist = await User.findOne({
          where: {
            username: resBody.username,
            status: true,
          }
        });
        if(usernameExist) {
          await transaction.rollback();
          return {
            message: messages.user.errors.in_use.username,
            error: true,
            statusCode: 400
          }
        };
        // Email Validation
        const emailExist = await User.findOne({
          where: {
            email: resBody.email,
            status: true,
          }
        });
        if(emailExist) {
          await transaction.rollback();
          return {
            message: messages.user.errors.in_use.email,
            error: true,
            statusCode: 400
          }
        };

        // Role Validation
        for (const iterator of roles) {
          const roleExist = await Role.findOne({
            where: {
              id: iterator,
              status: true
            }
          });
          if(!roleExist) {
            await transaction.rollback();
            return {
              message: messages.role.errors.not_found,
              error: true,
              statusCode: 404
            }
          };
        }

        // Hash Password Validation
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(body.password, salt);
        
        // Create User
        const data = await User.create(
          {
            ...resBody,
            password: hashedPassword
          }, 
          {
            transaction 
          }
        );

        if(!data) {
          await transaction.rollback();
          return {
            error: true,
            message: messages.user.errors.service.create,
            statusCode: 400
          }
        };

        // associate role with the user recently created
        for (const iterator of roles) {
          const userRolesData = await UserRoles.create({
            userId: data.id,
            roleId: iterator
          },{transaction});
          if(!userRolesData) {
            await transaction.rollback();
            return {
              error: true,
              message: 'Usuario no creado',
              statusCode: 400
            }
          }
        }

        await transaction.commit();

        const newData = await User.findOne({
          where: {
            id: data.id,
            status: true
          },
          attributes: {
            exclude: ['createdAt','updatedAt','status','password'],
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
        });

        return {
          error: false,
          message: messages.user.success.create,
          data:newData
        };
      }

      // username Validation
      const usernameExist = await User.findOne({
        where: {
          username: resBody.username,
          status: true,
        }
      });
      if(usernameExist) {
        return {
          message: messages.user.errors.in_use.username,
          error: true,
          statusCode: 400
        }
      };
      // Email Validation
      const emailExist = await User.findOne({
        where: {
          email: resBody.email,
          status: true,
        }
      });
      if(emailExist) {
        return {
          message: messages.user.errors.in_use.email,
          error: true,
          statusCode: 400
        }
      };

      // Role Validation
      for (const iterator of roles) {
        const roleExist = await Role.findOne({
          where: {
            id: iterator,
            status: true
          }
        });
        if(!roleExist) {
          return {
            message: messages.role.errors.not_found,
            error: true,
            statusCode: 404
          }
        };
      }

      // Hash Password Validation
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(body.password, salt);
      
      // Create User
      const data = await User.create(
        {
          ...resBody,
          password: hashedPassword
        }, 
        {
          transaction 
        }
      );

      if(!data) {
        return {
          error: true,
          message: messages.user.errors.service.create,
          statusCode: 400
        }
      };

      // associate role with the user recently created
      for (const iterator of roles) {
        const userRolesData = await UserRoles.create({
          userId: data.id,
          roleId: iterator
        },{transaction});
        if(!userRolesData) {
          return {
            error: true,
            message: 'Usuario no creado',
            statusCode: 400
          }
        }
      }

      return {
        error: false,
        message: messages.user.success.create,
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

      // variables 
      const userRolesExist = []; // i have declared this variable  just for manage what rol i need to change.
      // Destructuring data
      const {roles, ...resBody} = body;

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
      
      // this is when you try to create a user directly
      if(!transaction) {
        transaction = await sequelize.transaction();
        // Username Validation
        if(resBody.username) {
          const usernameExist = await User.findOne({
            where: {
              username: resBody.username,
              status: true,
              id: {
                [Op.ne]: id
              }
            }
          });
          if(usernameExist) {
            await transaction.rollback();
            return {
              message: `Nombre de Usuario está en uso`,
              error: true,
              statusCode: 400
            }
          };
        };

        // Email Validation
        if(resBody.email) {
          const emailExist = await User.findOne({
            where: {
              email: resBody.email,
              status: true,
              id: {
                [Op.ne]: id
              }
            }
          });
          if(emailExist) {
            await transaction.rollback();
            return {
              message: `Correo está en uso`,
              error: true,
              statusCode: 400
            }
          };
        };

        // Roles Validatrion
        if(roles) {
          for (const iterator of roles) {
            const roleResponse = await Role.findOne({
              where: {
                id: iterator,
                status: true
              }
            });
            if(!roleResponse) {
              await transaction.rollback();
              return {
                message: messages.role.errors.not_found,
                error: true,
                statusCode: 404
              }
            };
            userRolesExist.push(roleResponse.id);
          }
        };

        // Update User
        const data = await User.update(resBody, {
          where: {
            id
          },
          returning: true,
          transaction
        });

        if(!data) {
          await transaction.rollback();
          return {
            error: true,
            message: `Usuario no actualizado`,
            statusCode: 400
          }
        };
        
        // associate role with the user recently created
        /* eslint-disable no-plusplus */
        if(roles) {
          for (let i=0; i<roles.length; i++) {
            const userRolesData = await UserRoles.update({
              userId: data.id,
              roleId: roles[i]
            },{
              where: {
                id: userRolesExist[i]
              },
              transaction
            });
            if(!userRolesData) {
              logger.error(`There was an error trying to update the role: ${roles[i]} in UserRoles table for this user: ${data.id}`);
              await transaction.rollback();
              return {
                error: true,
                message: 'Usuario no creado',
                statusCode: 400
              }
            }
          }
        }
        
        await transaction.commit();

        // Getting User Updated
        const newData = await User.findOne({
          where: {
            id: data.id,
            status: true
          },
          attributes: {
            exclude: ['createdAt','updatedAt','status','password'],
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
        });

        return {
          error: false,
          message: 'Usuario actualizado',
          data: newData
        };
      }

      // Username Validation
      if(resBody.username) {
        const usernameExist = await User.findOne({
          where: {
            username: resBody.username,
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
      if(resBody.email) {
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
      if(roles) {
        for (const iterator of roles) {
          const roleResponse = await Role.findOne({
            where: {
              id: iterator,
              status: true
            }
          });
          if(!roleResponse) {
            return {
              message: messages.role.errors.not_found,
              error: true,
              statusCode: 404
            }
          };
          userRolesExist.push(roleResponse.id);
        }
      };

      const data = await User.update(resBody, {
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

      if(roles) {
        for (let i=0; i<roles.length; i++) {
          const userRolesData = await UserRoles.update({
            userId: data.id,
            roleId: roles[i]
          },{
            where: {
              id: userRolesExist[i]
            },
            transaction
          });
          if(!userRolesData) {
            logger.error(`There was an error trying to update the role: ${roles[i]} in UserRoles table for this user: ${data.id}`);
            return {
              error: true,
              message: 'Usuario no creado',
              statusCode: 400
            }
          }
        }
      }

      return {
        error: false,
        message: 'Usuario actualizado',
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

      if(!transaction) {
        transaction = await sequelize.transaction();

        // User Exist
        const userExist = await User.findOne({
          where: {
            id
          }
        });
        if(!userExist) {
          await transaction.rollback();
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
              id:userExist.id
            },
            transaction
          }
        );

        if (!data) {
          await transaction.rollback();
          return {
            message: `Usuario no fue eliminado`,
            error: true,
            statusCode: 400
          };
        };

        // Delete the roles associated to the user's Tutor
        const userRolesData = await UserRoles.findAll({
          where: { userId: id }
        });
        
        for (const iterator of userRolesData) {
          await UserRoles.destroy({
            where: {
              id: iterator.id
            },
            transaction
          });
        }

        return {
          error: false,
          message: 'Usuario eliminado',
        }
      }
      
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

      // Delete the roles associated to the user's Tutor
      const userRolesData = await UserRoles.findAll({
        where: { userId: id }
      });
      
      for (const iterator of userRolesData) {
        await UserRoles.destroy({
          where: {
            id: iterator.id
          },
          transaction
        });
      }

      return {
        error: false,
        message: 'Usuario eliminado',
      }

    } catch (error) {
      logger.error(`There was an error in User services: ${error}`);
      return {
        message: `There was an error in User services: ${error}`,
        error: true,
        statusCode: 500
      }
    }
  }
}


