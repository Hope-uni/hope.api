const logger = require('@config/logger.config');
const {
  allCategories,
  createCategory,
  updateCategory,
  findCategory,
  removeCategory
} = require('@services/category.service');
const { categoryEntry, idEntry } = require('@validations/index');
const { formatJoiMessages, messages } = require('@utils/index');


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

      return res.status(statusCode).json({
        error,
        statusCode,
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
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, statusCode, message, data } = await findCategory(req.params.id);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message
        });
      }

      return res.status(statusCode).json({
        error,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.category.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      });
    }
  },

  async create(req,res) {
    try {
      
      const { error } = categoryEntry.createCategoryValidation(req.body);
      if(error) return res.status(400).json({ 
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, statusCode, message, validationErrors, data } = await createCategory(req.body);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
          validationErrors
        });
      }

      return res.status(statusCode).json({
        error,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.category.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      });
    }
  },

  async update(req,res) {
    try {

      const { error } = categoryEntry.updateCategoryValidation({id: req.params.id, ...req.body});
      if(error) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, statusCode, message, validationErrors, data } = await updateCategory(req.params.id,req.body);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
          validationErrors
        });
      }

      return res.status(statusCode).json({
        error,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.category.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      });
    }
  },

  async remove(req,res) {
    try {
      
      const { error } = idEntry.findOneValidation({id:req.params.id});
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, statusCode, message } = await removeCategory(req.params.id);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message
        });
      }

      return res.status(statusCode).json({
        error,
        statusCode,
        message
      });

    } catch (error) {
      logger.error(`${messages.category.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      });
    }
  }

}