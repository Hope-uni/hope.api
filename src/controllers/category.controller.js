const logger = require('@config/logger.config');
const {
  allCategories,
  createCategory,
  updateCategory,
  findCategory,
  removeCategory
} = require('@services/category.service');
const { categoryEntry, idEntry } = require('@validations/index');
const messages = require('@utils/messages.utils');


module.exports = {

  async all(req,res) {
    try {
      
      const { error, message, statusCode, data } = await allCategories(req.query);

      if(error) {
        return res.status(statusCode).json({
          error,
          statusCode,
          message
        });
      };

      return res.status(200).json({
        error,
        statusCode: 200,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.category.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.category.errors.controller}: ${error}`
      });
    }
  },

  async findOne(req,res) {
    try {
      const { error } = idEntry.findOneValidation({ id:req.params.id });
      if(error) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: error.details[0].message
      });

      const { error:dataError, statusCode, message, data } = await findCategory(req.params.id);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message
        });
      }

      return res.status(200).json({
        error,
        statusCode: 200,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.category.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.category.errors.controller}: ${error}`
      });
    }
  },

  async create(req,res) {
    try {
      
      const { error } = categoryEntry.createCategoryValidation(req.body);
      if(error) return res.status(400).json({ error: error.details[0].message });

      const { error:dataError, statusCode, message, data } = await createCategory(req.body);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message
        });
      }

      return res.status(201).json({
        error,
        statusCode: 201,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.category.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.category.errors.controller}: ${error}`
      });
    }
  },

  async update(req,res) {
    try {

      const { error } = categoryEntry.updateCategoryValidation({id: req.params.id, ...req.body});
      if(error) return res.status(400).json({ error: error.details[0].message });

      const { error:dataError, statusCode, message, data } = await updateCategory(req.params.id,req.body);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message
        });
      }

      return res.status(200).json({
        error,
        statusCode: 200,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.category.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.category.errors.controller}: ${error}`
      });
    }
  },

  async remove(req,res) {
    try {
      
      const { error } = idEntry.findOneValidation({id:req.params.id});
      if(error) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: error.details[0].message
      });

      const { error:dataError, statusCode, message } = await removeCategory(req.params.id);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message
        });
      }

      return res.status(200).json({
        error,
        statusCode: 200,
        message
      });

    } catch (error) {
      logger.error(`${messages.category.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.category.errors.controller}: ${error}`
      });
    }
  }

}