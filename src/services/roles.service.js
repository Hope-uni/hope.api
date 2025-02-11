const { Permission, Role } = require('@models/index');
const logger = require('@config/logger.config');
const { sequelize } = require('@models/index');
const { Op } = require('sequelize');
const { pagination, messages, formatErrorMessages } = require('@utils/index');

module.exports = {

  /**
   * The function `allRoles` retrieves all roles excluding the role with id 1 along with their
   * associated permissions, handling errors appropriately.
   * @returns The function `allRoles()` returns an object with two possible structures:
  */
  /* eslint-disable radix */
  /* eslint-disable consistent-return */
  async allRoles(query) {
    try { 

      if(!query.page || !query.size || parseInt(query.page) === 0 && parseInt(query.size) === 0){
        const data = await Role.findAll({
          where: {
            [Op.and]: [
              {
                id: {
                  [Op.ne]: 1,
                }
              },
              {
                status: true
              }
            ]
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
        });
  
        return {
          error: false,
          statusCode: 200,
          message: messages.role.success.all,
          data
        };
      }

      const { limit, offset } = pagination.paginationValidation(query.page, query.size);

      const data = await Role.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: {
          [Op.and]: [
            {
              id: {
                [Op.ne]: 1,
              }
            },
            {
              status: true
            }
          ]
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
      });

      const dataResponse = pagination.getPageData(data, query.page, limit);
      return {
        error: false,
        statusCode: 200,
        message: messages.role.success.all,
        ...dataResponse
      };
      
    } catch (error) {
      logger.error(`${messages.role.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      };
    }
  },

  /**
   * The function `findRole` asynchronously retrieves a role with associated permissions while handling
   * potential errors.
   * @param id - The `findRole` function you provided is an asynchronous function that retrieves a role
   * by its `id` along with its associated permissions. Here's a breakdown of the function:
   * @returns The `findRole` function returns an object with either an error message or the role data
   * based on the outcome of the database query. If the role with the specified ID is found, it returns
   * an object with `error` set to `false` and the `data` containing the role information. If the role
   * does not exist, it returns an object with an error message stating "Role does not
   */
  async findRole(id) {
    try {
      
      const data = await Role.findOne({ 
        where: { 
          [Op.and]: [
            {
              id
            },
            {
              status: true
            }
          ]
        },
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'status'],
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
      });

      if(!data) {
        return {
          error: true,
          statusCode: 404,
          message: messages.role.errors.not_found,
        }
      };

      return {
        error: false,
        statusCode: 200,
        message: messages.role.success.found,
        data
      };

    } catch (error) {
      logger.error(`${messages.role.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      };
    }
  },


  /**
   * The function `createRole` creates a new role in a database, associates permissions with the role,
   * and returns the created role with its permissions.
   * @param body - The `createRole` function you provided is an asynchronous function that creates a
   * new role in a system. It first checks if the role name already exists in the database, then
   * creates the role, binds permissions to the role, and finally commits the transaction.
   * @returns The function `createRole` returns an object with the following properties:
   * - `message`: A message indicating the outcome of the operation (e.g., success message or error
   * message).
   * - `error`: A boolean value indicating whether an error occurred during the operation.
   * - `data`: If the operation was successful, it includes the newly created role data with
   * permissions.
   * If an error occurs during the operation,
   */
  async createRole(body) {
    const transaction = await sequelize.transaction();
    try {
      
      // Vaslidate if name exist
      const nameExist = await Role.findOne({where: { name: body.name }});
      if(nameExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('name', messages.role.errors.in_use.name),
        }
      };

      // Validate if permissions ID exist
      /* eslint-disable no-restricted-syntax */
      /* eslint-disable no-await-in-loop */
      for (const iterator of body.permissions) {
        const permissionsExist = await Permission.findOne({
          where: {
            id: iterator
          }
        });
        if(!permissionsExist) {
          logger.error(`El Identificador: ${iterator} no existe en la table Permisos de la base de datos`)
          await transaction.rollback();
          return {
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('permissions', messages.role.errors.permissions.not_found),
          }
        }
      }

      // Create Role
      const data = await Role.create(
        {
          name: body.name
        },
        { transaction }
      );
      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('create', messages.role.errors.service.create),
        }
      };

      // Biding permissions with role in RolePermissions table
      await data.addPermissions(body.permissions, { transaction });
      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('create', messages.role.errors.service.create),
        }
      };

      // Commit Transaction
      await transaction.commit();

      const newRole = await Role.findOne({
        where: {
          id: data.id
        },
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'status'],
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
      });

      return {
        error: false,
        statusCode: 201,
        message: messages.role.success.create,
        data: newRole
      };

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.role.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      };
    }
  },

  /**
   * The function `updateRole` in JavaScript updates a role in a database transaction, handling
   * validation and error cases.
   * @param id - The `id` parameter in the `updateRole` function represents the unique identifier of
   * the role that you want to update. It is used to identify the specific role in the database that
   * you wish to modify.
   * @param body - The `body` parameter in the `updateRole` function likely contains the data needed to
   * update a role. It seems to include the new name for the role (`body.name`) and the permissions
   * associated with the role (`body.permissions`).
   * @returns The `updateRole` function returns an object with the following properties:
   * - `message`: A message indicating the outcome of the update operation.
   * - `error`: A boolean value indicating if an error occurred during the update operation.
   * - `data`: If the update was successful, it includes the updated role data with permissions.
   * - If an error occurs during the update operation, it returns an error message with
   */
  async updateRole(id,body) {
    const transaction = await sequelize.transaction();
    try {
      
      // Validate if Role Exist
      let roleExist = await Role.findOne({
        where: {
          [Op.and]: [
            {
              id
            },
            {
              status: true
            }
          ]
        }
      });
      if(!roleExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('rol', messages.role.errors.not_found),
        };
      };

      // Vaslidate if name exist
      const nameExist = await Role.findOne({
        where: { 
          [Op.and]: [
            {
              name: body.name
            },
            {
              id: {
                [Op.ne]: id
              }
            }
          ]
        }
      });
      if(nameExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('name', messages.role.errors.in_use.name),
        };
      };

      // Update Role
      await Role.update(
        {
          name: body.name
        },
        {
          where: {
            id
          },
          transaction
        }
      );

      if(body.permissions) {
        await roleExist.removePermissions(await roleExist.getPermissions(), {
          transaction
        });
        await roleExist.addPermissions(body.permissions,{ transaction });
      }

      if(!roleExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('update', messages.role.errors.service.update),
        }
      };

      // Commit Transaction
      await transaction.commit();

      roleExist = await Role.findOne({ 
        where: { id },
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'status'],
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
      });

      return {
        error: false,
        statusCode: 200,
        message: messages.role.success.update,
        data: roleExist
      };

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.role.errors.service.base}: ${error}`);	
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      };
    }
  },

  /**
   * The function `deleteRole` deletes a role from the database after checking for its existence and
   * handling potential errors.
   * @param id - The `deleteRole` function you provided is an asynchronous function that deletes a role
   * based on the given `id`. If the `id` is 1, it will return a message saying that the role cannot be
   * deleted. Otherwise, it will check if the role exists and is active before updating its
   * @returns The `deleteRole` function returns an object with a `message` and `error` property. The
   * specific return values are as follows:
   */
  async deleteRole(id){
    const transaction = await sequelize.transaction();
    try {

      if (id === 1) {
        return {
          error: true,
          statusCodw: 404,
          message: messages.role.errors.not_found,
        };
      }
      
      // Validate if Role Exist
      const roleExist = await Role.findOne({
        where: {
          [Op.and]: [
            {
              id
            },
            {
              status: true
            }
          ]
        }
      });
      if(!roleExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.role.errors.not_found,
        };
      };

      await Role.update(
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

      // Commit Transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.role.success.delete,
      };

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.role.errors.service.base}: ${error}`);	
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      };
    }
  }

}