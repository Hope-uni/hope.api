const { User, Role, sequelize } = require('@models/index.js');
const bcrypt = require('bcrypt');
const logger = require('@config/logger.config');
const { Op } = require('sequelize');
const { paginationValidation, getPageData } = require('@utils/pagination.util');


module.exports = {

  async allUsers(query) {
    try {

      // Pagination
      const { limit, offset } = paginationValidation(query.page,query.size);
      
      const data = await User.findAndCountAll({
        limit,
        offset,
        where: {
          id: {
            [Op.ne]: 1
          },
          status: true
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status'],
        },
        include: [
          {
            model: Role,
            attributes: {
              exclude: ['createdAt','updatedAt', 'status']
            },
          }
        ]
      });

      if(data.count === 0) {
        return {
          message: `No existen usuarios en el Sistema`,
          error: true,
          statusCode: 404
        }
      };

      const dataResponse = getPageData(data, query.page, limit);

      return {
        error: false,
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

  async createUser(body) {
    const transaction = await sequelize.transaction();
    try {
      
      // username Validation
      const usernameExist = await User.findOne({
        where: {
          username: body.username,
          status: true,
        }
      });
      if(usernameExist) {
        await transaction.rollback();
        return {
          message: `Nombre de Usuario esta en uso`,
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
        await transaction.rollback();
        return {
          message: `Correo esta en uso`,
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
        await transaction.rollback();
        return {
          message: `Rol no encontrado`,
          error: true,
          statusCode: 404
        }
      };

      // Hash Password Validation
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(body.password, salt);
      
      const data = await User.create({
        ...body,
        password: hashedPassword
      }, { transaction });

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
      await transaction.rollback();
      logger.error(error);
      return {
        message: `There was an error in User services: ${error}`,
        error: true,
        statusCode: 500
      }
    }
  },

  async updateUser(id, body) {
    const transaction = await sequelize.transaction();
    try {

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
          await transaction.rollback();
          return {
            message: `Nombre de Usuario esta en uso`,
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
          await transaction.rollback();
          return {
            message: `Correo esta en uso`,
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
          await transaction.rollback();
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
        returning: true,attributes: {
          exclude: ['createdAt','updatedAt','status','password'],
        },
        include: [
          {
            model: Role,
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
          }
        ],
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

      // Commit Transaction 
      await transaction.commit();


      return {
        error: false,
        message: 'Usuario actualizado',
        data
      };

    } catch (error) {
      await transaction.rollback();
      logger.error(error);
      return {
        message: `There was an error in User services: ${error}`,
        error: true,
        statusCode: 500
      }
    }
  },


  async deleteUser(id) {
    const transaction = await sequelize.transaction();
    try {
      
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
            id
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

      // Commit Transaction 
      await transaction.commit();

      return {
        error: false,
        message: 'Usuario eliminado',
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(error);
      return {
        message: `There was an error in User services: ${error}`,
        error: true,
        statusCode: 500
      }
    }
  }
}