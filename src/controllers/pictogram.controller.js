const logger = require('@config/logger.config');
const {
  messages,
  formatJoiMessages,
  formatErrorMessages
} = require('@utils');
const {
  allPictograms,
  findPictogram,
  createPictogram,
  updatePictogram,
  removePictogram,
} = require('@services/pictogram.service');
const {
  pictogramEntry,
  idEntry
} = require('@validations');



module.exports = {

  async all(req,res) {
    try {

      const { error,message, statusCode, ...data } = await allPictograms(req.query);
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
        ...data
      });

    } catch (error) {
      logger.error(`${messages.pictogram.errors.controller}: ${error}`);
      return res.status(500).json({
        error,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  async findOne(req,res) {
    try {

      const { error } = idEntry.findOneValidation({ id: req.params.id },messages.pictogram.fields.id);
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, statusCode, message, data } = await findPictogram(req.params.id);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
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
      logger.error(`${messages.pictogram.errors.controller}: ${error}`);
      return res.status(500).json({
        error,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  async create(req,res) {
    try {

      const { error } = pictogramEntry.createPictogramValidation(req.body);
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      if(!req.file) {
        return res.status(400).json({
          error: true,
          statusCode: 422,
          message: messages.generalMessages.bad_request,
          validationErrors: formatErrorMessages('imageUrl', messages.pictogram.fields.image.required)
        })
      }

      const { error:dataError, statusCode, message, validationErrors, data } = await createPictogram(req.body, req.file);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message,
          validationErrors
        });
      };

      return res.status(statusCode).json({
        error,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.pictogram.errors.controller}: ${error}`);
      return res.status(500).json({
        error,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  async update(req,res) {
    try {

      const { error } = pictogramEntry.updatePictogramValidation({id: req.params.id, ...req.body});
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, statusCode, message, validationErrors, data } = await updatePictogram(req.params.id,req.body, req.file);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message,
          validationErrors
        });
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.pictogram.errors.controller}: ${error}`);
      return res.status(500).json({
        error,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  async removePictogram(req,res) {
    try {

      const { error } = idEntry.findOneValidation({ id: req.params.id }, messages.pictogram.fields.id);
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, statusCode, message } = await removePictogram(req.params.id);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message
        });
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message
      });

    } catch (error) {
      logger.error(`${messages.pictogram.errors.controller}: ${error}`);
      return res.status(500).json({
        error,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  }

}
