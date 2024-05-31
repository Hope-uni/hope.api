const logger = require('@config/logger.config');
const {
  messages
} = require('@utils/index');
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
} = require('@validations/index');



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

      return res.status(200).json({
        error,
        statusCode: 200,
        message,
        ...data
      });

    } catch (error) {
      logger.error(`${messages.pictogram.errors.controller}: ${error}`);
      return res.status(500).json({
        error,
        statusCode: 500,
        message: `${messages.pictogram.errors.controller}: ${error}`,
      });
    }
  },

  async findOne(req,res) {
    try {

      const { error } = idEntry.findOneValidation({ id: req.params.id });
      if(error) return res.status(400).json({ error: error.details[0].message });

      const { error:dataError, statusCode, message, data } = await findPictogram(req.params.id);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
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
      logger.error(`${messages.pictogram.errors.controller}: ${error}`);
      return res.status(500).json({
        error,
        statusCode: 500,
        message: `${messages.pictogram.errors.controller}: ${error}`,
      });
    }
  },

  async create(req,res) {
    try {
      
      const { error } = pictogramEntry.createPictogramValidation(req.body);
      if(error) return res.status(400).json({ error: error.details[0].message });

      const { error:dataError, statusCode, message, data } = await createPictogram(req.body);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message
        });
      };

      return res.status(201).json({
        error,
        statusCode: 201,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.pictogram.errors.controller}: ${error}`);
      return res.status(500).json({
        error,
        statusCode: 500,
        message: `${messages.pictogram.errors.controller}: ${error}`,
      });
    }
  },

  async update(req,res) {
    try {
      
      const { error } = pictogramEntry.updatePictogramValidation({id: req.params.id, ...req.body});
      if(error) return res.status(400).json({ error: error.details[0].message });

      const { error:dataError, statusCode, message, data } = await updatePictogram(req.params.id,req.body);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message
        });
      };

      return res.status(200).json({
        error: dataError,
        statusCode: 200,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.pictogram.errors.controller}: ${error}`);
      return res.status(500).json({
        error,
        statusCode: 500,
        message: `${messages.pictogram.errors.controller}: ${error}`,
      });
    }
  },

  async removePictogram(req,res) {
    try {
      
      const { error } = idEntry.findOneValidation({ id: req.params.id });
      if(error) return res.status(400).json({ error: error.details[0].message });

      const { error:dataError, statusCode, message } = await removePictogram(req.params.id);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message
        });
      };

      return res.status(200).json({
        error: dataError,
        statusCode: 200,
        message
      });

    } catch (error) {
      logger.error(`${messages.pictogram.errors.controller}: ${error}`);
      return res.status(500).json({
        error,
        statusCode: 500,
        message: `${messages.pictogram.errors.controller}: ${error}`,
      });
    }
  }

}