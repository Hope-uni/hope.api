const { User, Role, UserRoles, sequelize } = require('@models/index.js');
const bcrypt = require('bcrypt');
const logger = require('@config/logger.config');
const { Op } = require('sequelize');
const { paginationValidation, getPageData} = require('@utils/pagination.util');
const { isAdmin } = require('@config/variables.config');
const { userSendEmail } = require('@helpers/user.helper');
const messages = require('@utils/messages.utils');
const dataStructure = require('@utils/data-structure.util');
const { generatePassword } = require('@utils/generatePassword.util');
const { formatErrorMessages } = require('@utils/formatErrorMessages.util');


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
  /* eslint-disable no-plusplus */
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
              attributes: {
                exclude: ['userId', 'roleId','createdAt','updatedAt']
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
        });

        return {
          error: false,
          statusCode: 200,
          message: messages.user.success.all,
          data: await dataStructure.userDataStructure(data),
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
            attributes: {
              exclude: ['userId', 'roleId','createdAt','updatedAt']
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
      });

      // Structuring data
      data.rows = await dataStructure.userDataStructure(data.rows);

      const dataResponse = getPageData(data, query.page, limit);

      return {
        error: false,
        statusCode: 200,
        message: messages.user.success.all,
        ...dataResponse
      };

    } catch (error) {
      logger.error(`${messages.user.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
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
          error: true,
          statusCode: 404,
          message: messages.user.errors.not_found,
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
            attributes: {
              exclude: ['userId', 'roleId','createdAt','updatedAt']
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
      });

      if(!data) {
        return {
          error: true,
          statusCode: 404,
          message: messages.user.errors.not_found,
        }
      };

      return {
        error: false,
        statusCode: 200,
        message: messages.user.success.found,
        data: await dataStructure.findUserDataStructure(data),
      };

    } catch (error) {
      logger.error(`${messages.user.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
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
        // Variables
        const passwordTemp = generatePassword();
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
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('username', messages.user.errors.in_use.username)
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
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('email', messages.user.errors.in_use.email),
          }
        };


        // Hash Password Validation
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordTemp, salt);
        
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
            message: messages.generalMessages.base,
            statusCode: 409,
            validationErrors: formatErrorMessages('create', messages.user.errors.service.create),
          }
        };

        // get admin user
        const getAdminRole = await Role.findOne({
          where: {
            name: isAdmin,
          }
        });

        if(!getAdminRole) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 404,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('role', messages.role.errors.not_found),
          }
        };

        // associate role with the user recently created
        const userRolesData = await UserRoles.create({
          userId: data.id,
          roleId: getAdminRole.id
        },{transaction});
        if(!userRolesData) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('role', messages.user.errors.service.create),
          }
        }

        // Send email with temporary password
        const { error: emailError, message: emailMessage } = await userSendEmail({
          email: resBody.email,
          password: passwordTemp,
          username: resBody.username,
        });

        if(emailError) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('sendEmail', emailMessage),
          }
        };

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
              attributes: {
                exclude: ['userId', 'roleId','createdAt','updatedAt']
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
        });


        return {
          error: false,
          message: messages.user.success.create,
          data: dataStructure.findUserDataStructure(newData)
        };
      };

      // This part is applied when you are creating a therapist, tutor or patient register.
      // username Validation
      const usernameExist = await User.findOne({
        where: {
          username: resBody.username,
          status: true,
        }
      });
      if(usernameExist) {
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('username', messages.user.errors.in_use.username),
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
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('email', messages.user.errors.in_use.email),
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
            error: true,
            statusCode: 404,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('role', messages.role.errors.not_found),
          }
        };
      }

      // Hash Password Validation
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(resBody.password, salt);
      
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
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('create', messages.user.errors.service.create),
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
            statusCode: 409,
            message: messages.user.errors.service.create,
            validationErrors: formatErrorMessages('create', messages.user.errors.service.create),
          }
        }
      }

      return {
        error: false,
        statusCode: 201,
        message: messages.user.success.create,
        data,
      };
    } catch (error) {
      logger.error(`${messages.user.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

  
  async updateUser(id, body, transaction) {
    try {
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
            },
            {
              status: true,
            }
          ],
          
        }
      });
      if(!userExist) {
        return {
          error: true,
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('user', messages.user.errors.not_found),
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
              error: true,
              statusCode: 409,
              message: messages.generalMessages.base,
              validationErrors: formatErrorMessages('username', messages.user.errors.in_use.username),
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
              error: true,
              statusCode: 409,
              message: messages.generalMessages.base,
              validationErrors: formatErrorMessages('email', messages.user.errors.in_use.email),
            }
          };
        };

        // Update User
        const data = await User.update({...resBody}, {
          where: {
            id
          },
          transaction
        });

        if(!data) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('update', messages.user.errors.service.update),
          }
        };
        
        
        await transaction.commit();

        // Getting User Updated
        const newData = await User.findOne({
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
              attributes: {
                exclude: ['userId', 'roleId','createdAt','updatedAt']
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
        });

        return {
          error: false,
          statusCode: 200,
          message: messages.user.success.update,
          data: dataStructure.findUserDataStructure(newData)
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
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('username', messages.user.errors.in_use.username),
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
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('email', messages.user.errors.in_use.email),
          }
        };
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
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('update', messages.user.errors.service.update),
        }
      };

      return {
        error: false,
        statusCode: 200,
        message: messages.user.success.update,
        data,
      };

    } catch (error) {
      logger.error(`${messages.user.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },


  async deleteUser(id, transaction) {
    try {

      if(!transaction) {
        transaction = await sequelize.transaction();

        // User Exist
        const userExist = await User.findOne({
          where: {
            id,
            status: true,
          },
          include: [
            {
              model: UserRoles,
              where: {
                userId: id
              },
              attributes: {
                exclude: ['userId', 'roleId','createdAt','updatedAt']
              },
              include: [
                {
                  model: Role,
                  where: {
                    name: 'Admin'
                  },
                  attributes: {
                    exclude: ['createdAt','updatedAt','status']
                  },
                }
              ]
            }
          ]
        });
        if(!userExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 404,
            message: messages.user.errors.not_found,
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
            error: true,
            statusCode: 400,
            message: messages.user.errors.service.delete, 
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

        await transaction.commit();

        return {
          error: false,
          statusCode: 200,
          message: messages.user.success.delete,
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
          error: true,
          statusCode: 404,
          message: messages.user.errors.not_found,
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
          error: true,
          statusCode: 400,
          message: messages.user.errors.service.delete,
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
        statusCode: 200,
        message: messages.user.success.delete,
      }

    } catch (error) {
      logger.error(`${messages.user.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },


  async addRoleUser(userId, roleId) {
    const transaction = await sequelize.transaction();
    try {

      // superuser does not need other role
      if(parseInt(userId) === 1) {
        return {
          error: true,
          statusCode: 409,
          message: messages.user.errors.rol_forbidden,
        }
      }

      if(parseInt(roleId) === 1 || parseInt(roleId) === 2 || parseInt(roleId) === 4 || parseInt(roleId) === 5) {
        return {
          error: true,
          statusCode: 400,
          message: messages.role.errors.forbidden,
        }
      }

      const userExist = await User.findOne({
        where: {
          [Op.and]: [
            {
              id:userId
            },
            {
              status: true,
            }
          ],
        },
        include: [
          {
            model: UserRoles,
            attributes: {
              exclude: ['userId', 'roleId','createdAt','updatedAt']
            },
            include: [
              {
                model: Role,
                where: {
                  [Op.and]: [
                    {
                      name: {
                        [Op.ne]: 'Admin'
                      }
                    },
                    {
                      name: {
                        [Op.ne]: 'Tutor'
                      }
                    },
                    {
                      name: {
                        [Op.ne]: 'Paciente'
                      }
                    }
                  ]
                },
                attributes: {
                  exclude: ['createdAt','updatedAt','status']
                },
              }
            ]
          }
        ]
      });
      if(!userExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.user.errors.not_found,
        }
      }

      // Validate if user has this Role.
      const findUserRoles = await UserRoles.findOne({
        where: {
          userId,
          roleId
        }
      });
      if(findUserRoles) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 400,
          message: messages.role.errors.in_use.rol,
        }
      }

      const data = await UserRoles.create({
        userId,
        roleId
      },{transaction});
      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 400,
          message: messages.user.errors.service.add_role,
        }
      }

      await transaction.commit();
      
      return {
        error: false,
        statusCode: 200,
        message: messages.user.success.add_role,
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.user.errors.service.base}: ${error.message}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      };
    }
  },


  /**
   * The function `removeRoleUser` is an asynchronous function that removes a specific role from a user
   * while handling various validations and transactions.
   * @param userId - The `userId` parameter in the `removeRoleUser` function represents the unique
   * identifier of the user whose role is being removed. This identifier is used to locate the specific
   * user in the database and perform operations related to removing a role from that user.
   * @param roleId - The `roleId` parameter in the `removeRoleUser` function represents the ID of the
   * role that you want to remove from a user. This function is designed to remove a specific role from
   * a user, given the user's ID and the role's ID. The function performs various checks and
   * validations before
   * @returns The function `removeRoleUser` returns an object with properties `error`, `statusCode`,
   * and `message`. The specific return values depend on the conditions met during the execution of the
   * function:
   */
  async removeRoleUser(userId,roleId) {
    const transaction = await sequelize.transaction();
    try {
      
      // superuser does not need other role
      if(parseInt(userId) === 1) {
        return {
          error: true,
          statusCode: 400,
          message: messages.user.errors.service.delete_role_user,
        }
      }

      if(parseInt(roleId) === 1 || parseInt(roleId) === 2 || parseInt(roleId) === 3 || parseInt(roleId) === 4) {
        return {
          error: true,
          statusCode: 400,
          message: messages.role.errors.unsign_rol,
        }
      }

      const userExist = await User.findOne({
        where: {
          [Op.and]: [
            {
              id:userId
            },
            {
              status: true,
            }
          ],
        },
        include: [
          {
            model: UserRoles,
            attributes: {
              exclude: ['userId', 'roleId','createdAt','updatedAt']
            },
            include: [
              {
                model: Role,
                where: {
                  [Op.and]: [
                    {
                      name: {
                        [Op.ne]: 'Admin'
                      }
                    },
                    {
                      name: {
                        [Op.ne]: 'Paciente'
                      }
                    }
                  ]
                },
                attributes: {
                  exclude: ['createdAt','updatedAt','status']
                },
              }
            ]
          }
        ]
      });
      if(!userExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.user.errors.not_found,
        }
      }

      // Validate if user has Therapist Role.
      const findUserRoles = await UserRoles.findOne({
        where: {
          userId,
          roleId: 3
        }
      });
      if(!findUserRoles) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 400,
          message: messages.role.errors.unsign_rol,
        }
      }
      
      // Validate if user has Therapist Role.
      const findUserWithRoleGaveIt = await UserRoles.findOne({
        where: {
          userId,
          roleId
        }
      });
      if(!findUserWithRoleGaveIt) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: `${messages.role.errors.not_found} para este usuario`,
        }
      }

      await UserRoles.destroy({
        where: {
          id: findUserWithRoleGaveIt.id,
        },
        transaction
      });

      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.user.success.delete_role,
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.user.errors.service.base}: ${error.message}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      };
    }
  }

}


