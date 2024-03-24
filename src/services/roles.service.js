const { Permission, Role } = require('@models/index');
const logger = require('@config/logger.config');
const { sequelize } = require('@models/index');
const { Op } = require('sequelize');

module.exports = {

  /**
   * The function `allRoles` retrieves all roles excluding the role with id 1 along with their
   * associated permissions, handling errors appropriately.
   * @returns The function `allRoles()` returns an object with two possible structures:
   */
  async allRoles() {
    try {

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
        message: 'Lista de Roles',
        data
      };
      
    } catch (error) {
      logger.error(error.message);
      return {
        message: `There was an error in Role Services: ${error.message}`,
        error: true
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
          message: `Rol no encontrado`,
        }
      };

      return {
        error: false,
        message: 'Rol encontrado',
        data
      };

    } catch (error) {
      logger.error(error.message);
      return {
        error: true,
        statusCode: 500,
        message: `There was an error in Role Services: ${error.message}`,
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
          statusCode: 400,
          message: `Nombre de rol ya esta en uso`,
        }
      };

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
          statusCode: 400,
          message: `Rol no creado`,
        }
      };

      // Biding permissions with role in RolePermissions table
      await data.addPermissions(body.permissions, { transaction });
      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 400,
          message: `Rol no creado`,
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
        message: `Rol creado`,
        data: newRole
      };

    } catch (error) {
      await transaction.rollback();
      logger.error(error.message);
      return {
        error: true,
        statusCode: 500,
        message: `There was an error in Role Services: ${error.message}`,
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
          message: `Rol no encontrado`,
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
          statusCode: 400,
          message: `Nombre de rol ya esta en uso`,
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
          statusCode: 400,
          message: `Rol no actualizado`,
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
        message: `Rol actualizado`,
        data: roleExist
      };

    } catch (error) {
      await transaction.rollback();
      logger.error(error.message);
      return {
        error: true,
        statusCode: 500,
        message: `There was an error in Role Services: ${error.message}`,
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
          message: `Rol no encontrado`,
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
          message: `Rol no encontrado`,
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
        message: `Rol eliminado`,
        error: false,
      };

    } catch (error) {
      await transaction.rollback();
      logger.error(error.message);
      return {
        error: true,
        statusCode: 500,
        message: `There was an error in Role Services: ${error.message}`,
      };
    }
  }

}