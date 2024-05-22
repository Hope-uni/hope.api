const { Category, sequelize } = require('@models/index');
const { Op } = require('sequelize');
const logger = require('@config/logger.config');
const { messages, pagination } = require('@utils/index');

module.exports = {
  /* eslint-disable radix */
  async allCategories(query) {
    try {
      
      if(!query.page || !query.size || parseInt(query.page) === 0 && parseInt(query.size) === 0) {
        const data = await Category.findAll({
          where: {
            status: true,
          },
          attributes: {
            exclude: ['createdAt','updatedAt','status']
          }
        });

        return {
          error: false,
          message: messages.category.success.all,
          statusCode: 200,
          data
        }
      }

      const { limit, offset } = pagination.paginationValidation(query.page,query.size);

      const data = await Category.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: {
          status: true,
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        }
      });

      const dataResponse = pagination.getPageData(data,query.page,limit);

      return {
        error: false,
        message: messages.category.success.all,
        ...dataResponse
      }

    } catch (error) {
      logger.error(`${messages.category.errors.service.base}: ${error}`);
      return {
        error: true,
        message: `${messages.category.errors.service.base}: ${error}`,
        statusCode: 500
      }
    }
  },

  async findCategory(id) {
    try {
      
      const data = await Category.findOne({
        where: {
          id,
          status: true
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        }
      });

      if(!data) {
        return {
          error: true,
          statusCode: 404,
          message: messages.category.errors.not_found
        };
      }

      return {
        error: false,
        statusCode: 200,
        message: messages.category.success.found,
        data
      }

    } catch (error) {
      logger.error(`${messages.category.errors.controller}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: `${messages.category.errors.service.base}: ${error}`
      }
    }
  },

  async createCategory(body) {
    const transaction = await sequelize.transaction();
    try {
      
      // Name exist validation
      const nameExist = await Category.findOne({
        where: {
          name: body.name,
          status: true
        }
      });
      if(nameExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 400,
          message: messages.category.errors.in_use.name,
        }
      }

      // Icon exist validation
      // TODO: This will change when the API consume azure bucket
      const iconExist = await Category.findOne({
        where: {
          icon: body.icon,
          status: true
        }
      });
      if(iconExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 400,
          message: messages.category.errors.in_use.icon,
        }
      }

      // Create Category
      const categoryResponse = await Category.create(
        {
          name: body.name,
          icon: body.icon,
          status: true
        },
        { transaction }
      );
      if(!categoryResponse) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 400,
          message: messages.category.errors.service.create,
        }
      }

      // Commit Transaction
      await transaction.commit();

      // Get Category
      const data = await Category.findOne({
        where: {
          id: categoryResponse.id,
          status: true
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        }
      });

      return {
        error: false,
        message: messages.category.success.create,
        statusCode: 200,
        data
      }

    } catch (error) {
      logger.error(`${messages.category.errors.service.base}: ${error}`);
      await transaction.rollback();
      return {
        error: true,
        message: `${messages.category.errors.service.base}: ${error}`,
        statusCode: 500
      }
    }
  },

  async updateCategory(id,body) {
    const transaction = await sequelize.transaction();
    try {

      // Category exist valdition
      const categoryExist = await Category.findOne({
        where: {
          id,
          status: true
        }
      });
      if(!categoryExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.category.errors.not_found,
        }
      }
      
      // Name exist validation
      if(body.name) {
        const nameExist = await Category.findOne({
          where: {
            name: body.name,
            status: true,
            id: {
              [Op.ne]: id
            }
          }
        });
        if(nameExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 400,
            message: messages.category.errors.in_use.name,
          }
        }
      }

      // Icon exist validation
      // TODO: This will change when the API consume azure bucket
      if(body.icon) {
        const iconExist = await Category.findOne({
          where: {
            icon: body.icon,
            status: true,
            id: {
              [Op.ne]: id
            }
          }
        });
        if(iconExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 400,
            message: messages.category.errors.in_use.icon,
          }
        }
      }

      // Update Category
      const categoryResponse = await Category.update(
        {
          name: body.name,
          icon: body.icon
        },
        {
          where: {
            id
          },
          transaction
        }
      );
      if(!categoryResponse) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 400,
          message: messages.category.errors.service.update,
        }
      }

      // Commit Transaction
      await transaction.commit();

      // Get Category
      const data = await Category.findOne({
        where: {
          id,
          status: true
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        }
      });

      return {
        error: false,
        message: messages.category.success.update,
        statusCode: 200,
        data
      }

    } catch (error) {
      logger.error(`${messages.category.errors.service.base}: ${error}`);
      await transaction.rollback();
      return {
        error: true,
        message: `${messages.category.errors.service.base}: ${error}`,
        statusCode: 500
      }
    }
  },


  async removeCategory(id) {
    const transaction = await sequelize.transaction();
    try {
      // Category exist validation
      const categoryExist = await Category.findOne({
        where: {
          id,
          status: true
        }
      });
      if(!categoryExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.category.errors.not_found,
        }
      }

      // Update Category
      const categoryResponse = await Category.update(
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
      if(!categoryResponse) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 400,
          message: messages.category.errors.service.delete,
        }
      }

      // Commit transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.category.success.delete,
      }

    } catch (error) {
      logger.error(`${messages.category.errors.service.base}: ${error}`);
      await transaction.rollback();
      return {
        error: true,
        message: `${messages.category.errors.service.base}: ${error}`,
        statusCode: 500
      }
    }
  }

}