const { Op } = require('sequelize');
const { Pictogram, Category, sequelize } = require('@models/index');
const logger = require('@config/logger.config');
const { messages, pagination, formatErrorMessages, dataStructure } = require('@utils');


/* eslint-disable radix */
module.exports = {

  async allPictograms(query) {
    try {

      // Variables
      let pictogramWhereCondition = {
        status: true,
      }

      if(query.categoryId && !query.pictogramName) {
        // validate if category exist
        const categoryExist = await Category.findOne({
          where: {
            id: query.categoryId,
            status: true
          }
        });
        if(!categoryExist) {
          return {
            error: true,
            message: messages.category.errors.not_found,
            statusCode: 404
          }
        }

        pictogramWhereCondition = {
          ...pictogramWhereCondition,
          categoryId: categoryExist.id
        }

      }

      if(query.pictogramName && !query.categoryId) {
        pictogramWhereCondition = {
          ...pictogramWhereCondition,
          name: {
            [Op.iLike]: `%${query.pictogramName}%`
          }
        }
      }

      if(query.categoryId && query.pictogramName) {

        // validate if category exist
        const categoryExist = await Category.findOne({
          where: {
            id: query.categoryId,
            status: true
          }
        });
        if(!categoryExist) {
          return {
            error: true,
            message: messages.category.errors.not_found,
            statusCode: 404
          }
        }

        pictogramWhereCondition = {
          ...pictogramWhereCondition,
          name: {
            [Op.iLike]: `%${query.pictogramName}%`
          },
          categoryId: categoryExist.id,
        }
      }

      if(!query.page || !query.size || parseInt(query.page) === 0 && parseInt(query.size) === 0) {

        const data = await Pictogram.findAll({
          where: pictogramWhereCondition,
          order:[['name', 'ASC']],
          attributes: {
            exclude: ['createdAt','updatedAt','status','categoryId']
          },
          include: [
            {
              model: Category,
              where: {
                status: true,
              },
              attributes: ['id','name', 'icon']
            }
          ]
        });

        return {
          error: false,
          statusCode: 200,
          message: messages.pictogram.success.all,
          data: dataStructure.customPictogramDataStructure(data),
        }
      }

      const { limit, offset } = pagination.paginationValidation(query.page, query.size);

      const data = await Pictogram.findAndCountAll({
        limit,
        offset,
        distinct: true,
        order:[['name', 'ASC']],
        where: pictogramWhereCondition,
        attributes: {
          exclude: ['createdAt','updatedAt','status','categoryId']
        },
        include: [
          {
            model: Category,
            attributes: ['id','name', 'icon']
          }
        ]
      });

      // getting data structured
      data.rows = dataStructure.customPictogramDataStructure(data.rows);

      const dataResponse = pagination.getPageData(data, query.page, limit);

      return {
        error: false,
        statusCode: 200,
        message: messages.pictogram.success.all,
        ...dataResponse
      }

    } catch (error) {
      logger.error(`${messages.pictogram.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },


  async findPictogram(id) {
    try {

      const data = await Pictogram.findOne({
        where: {
          id,
          status: true,
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','categoryId']
        },
        include: [
          {
            model: Category,
            attributes: {
              exclude: ['createdAt','updatedAt', 'status']
            }
          }
        ]
      });

      if(!data) {
        return {
          error: true,
          statusCode: 404,
          message: messages.pictogram.errors.not_found,
        }
      }

      return {
        error: false,
        statusCode: 200,
        message: messages.pictogram.success.found,
        data: dataStructure.findPictogramDataStructure(data),
      }

    } catch (error) {
      logger.error(`${messages.pictogram.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },


  async createPictogram(body) {
    const transaction = await sequelize.transaction();
    try {

      // Category exist validation
      const categoryExist = await Category.findOne({
        where: {
          id: body.categoryId,
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
      const nameExist = await Pictogram.findOne({
        where: {
          name: body.name,
          status: true
        },
      });
      if(nameExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('name', messages.pictogram.errors.in_use.name),
        }
      }

      // TODO: Image exist logic has to be here.


      const data = await Pictogram.create(
        {
          name: body.name,
          categoryId: body.categoryId,
          imageUrl: body.imageUrl
        },
        { transaction }
      );

      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('create', messages.pictogram.errors.service.create),
        }
      }

      // Commit Transaction
      await transaction.commit();

      // Get Pictogram Created
      const newData = await Pictogram.findOne({
        where: {
          id:data.id,
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','categoryId']
        },
        include: [
          {
            model: Category,
            attributes: ['id','name', 'icon']
          }
        ]
      });

      return {
        error: false,
        statusCode: 201,
        message: messages.pictogram.success.create,
        data: dataStructure.findPictogramDataStructure(newData),
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.pictogram.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },


  async updatePictogram(id, body) {
    const transaction = await sequelize.transaction();
    try {

      // Pictogram Exist
      const pictogramExist = await Pictogram.findOne({
        where: {
          id,
          status: true
        }
      });
      if(!pictogramExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('pictogram', messages.pictogram.errors.not_found),
        }
      }

      // Category exist validation
      if(body.categoryId) {
        const categoryExist = await Category.findOne({
          where: {
            id: body.categoryId,
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
      }

      // Name exist validation
      if(body.name) {
        const nameExist = await Pictogram.findOne({
          where: {
            name: body.name,
            status: true,
            id: {
              [Op.ne]: id
            }
          },
        });
        if(nameExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('name', messages.pictogram.errors.in_use.name),
          }
        }
      }

      // Image validation
      if(body.imageUrl) {
        // TODO: Image exist logic has to be here.
      }

      const data = await Pictogram.update(
        {
          ...body
        },
        {
          where: {
            id
          },
          transaction
        }
      );

      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('update', messages.pictogram.errors.service.update),
        }
      }

      // Commit Transaction
      await transaction.commit();

      // Get Pictogram Updated
      const newData = await Pictogram.findOne({
        where: {
          id,
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','categoryId']
        },
        include: [
          {
            model: Category,
            attributes: ['id','name', 'icon']
          }
        ]
      });

      return {
        error: false,
        statusCode: 200,
        message: messages.pictogram.success.update,
        data: dataStructure.findPictogramDataStructure(newData),
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.pictogram.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

  async removePictogram(id) {
    const transaction = await sequelize.transaction();
    try {

      // Pictogram exist validation
      const pictogramExist = await Pictogram.findOne({
        where: {
          id,
          status: true
        }
      });
      if(!pictogramExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.pictogram.errors.not_found,
        }
      }

      const pictogramUpdated = await Pictogram.update(
        {
          status: false,
        },
        {
          where: {
            id
          },
          transaction
        }
      );

      if(!pictogramUpdated) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 400,
          message: messages.pictogram.errors.service.delete,
        }
      }

      // Commit Transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.pictogram.success.delete,
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.pictogram.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  }

}
