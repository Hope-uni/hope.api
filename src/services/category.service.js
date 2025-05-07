const { Op } = require('sequelize');
const { Category, Pictogram, sequelize } = require('@models/index');
const logger = require('@config/logger.config');
const { messages, pagination, formatErrorMessages, azureImages } = require('@utils');
const { categoryContainer, defaultCategoryImage } = require('@config/variables.config');

module.exports = {
  /* eslint-disable radix */
  async allCategories(query) {
    try {

      if(!query.page || !query.size || parseInt(query.page) === 0 && parseInt(query.size) === 0) {
        const data = await Category.findAll({
          where: {
            status: true,
          },
          order:[['createdAt', 'ASC']],
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
        order:[['createdAt', 'ASC']],
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        }
      });

      const dataResponse = pagination.getPageData(data,query.page,limit);

      return {
        error: false,
        statusCode: 200,
        message: messages.category.success.all,
        ...dataResponse
      }

    } catch (error) {
      logger.error(`${messages.category.errors.service.base}: ${error}`);
      return {
        error: true,
        message: messages.generalMessages.server,
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
        message: messages.generalMessages.server,
      }
    }
  },

  async createCategory(body, file) {
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
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('name', messages.category.errors.in_use.name),
        }
      }

      // Icon exist validation
      if(file) {
        const { error, statusCode, message, url } = await azureImages.uploadImage(file, categoryContainer);

        if(error) {
          await transaction.rollback();
          return {
            error,
            statusCode,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('upload', message),
          }
        }

        body.icon = url;
      } else {
        body.icon = defaultCategoryImage;
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
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('create', messages.category.errors.service.create),
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
        statusCode: 201,
        message: messages.category.success.create,
        data
      }

    } catch (error) {
      logger.error(`${messages.category.errors.service.base}: ${error}`);
      await transaction.rollback();
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

  async updateCategory(id,body, file) {
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
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('category', messages.category.errors.not_found),
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
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('name', messages.category.errors.in_use.name),
          }
        }
      }

      // Icon exist validation
      if(file) {
        const imageName = categoryExist.icon.split('/').pop();
        let handleError;

        if(categoryExist.icon === defaultCategoryImage) {
          const { url, ...restResponse } = await azureImages.updateAndUploadImage(file, null, categoryContainer);
          handleError = restResponse;

          body.icon = url;
        }

        if(categoryExist.icon !== defaultCategoryImage) {
          const { url, ...restResponse} = await azureImages.updateAndUploadImage(file, imageName, categoryContainer);
          handleError = restResponse;

          body.icon = url;
        }

        if(handleError.error) {
          await transaction.rollback();
          return {
            error: handleError.error,
            statusCode: handleError.statusCode,
            message: messages.generalMessages.server,
            validationErrors: formatErrorMessages('upload', handleError.message),
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
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('update', messages.category.errors.service.update),
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
        statusCode: 200,
        message: messages.category.success.update,
        data
      }

    } catch (error) {
      logger.error(`${messages.category.errors.service.base}: ${error}`);
      await transaction.rollback();
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
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

      // Validate if category is used it in Pictogram table
      const isCategoryInPictogram = await Pictogram.findOne({
        where: {
          categoryId: id,
          status: true,
        }
      });

      if(isCategoryInPictogram) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.category.errors.in_use.delete,
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
          statusCode: 409,
          message: messages.category.errors.service.delete,
        }
      }

      // delete the category image in the azure container
      if(categoryExist.icon !== defaultCategoryImage) {
        const imageName = categoryExist.icon.split('/').pop();
        const { error, statusCode, message } = await azureImages.deleteAzureImage(imageName, categoryContainer);

        if(error) {
          await transaction.rollback();
          return {
            error,
            statusCode,
            message
          }
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
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  }

}
