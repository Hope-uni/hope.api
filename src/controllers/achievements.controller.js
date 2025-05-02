const logger = require('@config/logger.config');
const { messages, formatJoiMessages } = require('@utils');
const {
  getAllAchievements,
  findAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  assignAchievement,
  unassignAchievement,
} = require('@services/achievements.service');
const { achievementsEntry, idEntry } = require('@validations');




module.exports = {

  async all(req,res) {
    try {

      const { error } = achievementsEntry.filtersValidation(req.query);
      if(error) {
        return res.status(400).json({
          error: true,
          statusCode: 422,
          message: error.details[0].message,
        });
      }

      const { error: dataError, statusCode, message, ...data } = await getAllAchievements(req.query,req.payload);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
        });
      }

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        ...data,
      });

    } catch (error) {
      logger.error(`${messages.achievements.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },


  async find(req,res) {
    try {

      const { error } = idEntry.findOneValidation({ id:req.params.id }, messages.achievements.fields.id);
      if(error) {
        return res.status(400).json({
          error: true,
          statusCode: 422,
          message: error.details[0].message
        });
      }

      const { error:dataError, statusCode, message, data } = await findAchievement(req.params.id, req.payload);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
        });
      }

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        data,
      });

    } catch (error) {
      logger.error(`${messages.achievements.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  async create(req,res) {
    try {

      const { error } = achievementsEntry.createAchievementsValidation(req.body);
      if(error) {
        return res.status(400).json({
          error: true,
          statusCode: 422,
          message: messages.generalMessages.bad_request,
          validationErrors: formatJoiMessages(error),
        });
      }

      const { error: dataError, statusCode, message, validationErrors, data } = await createAchievement(req.body, req.file);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
          validationErrors
        });
      }

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        data,
      });

    } catch (error) {
      logger.error(`${messages.achievements.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  async update(req,res) {
    try {

      const { error } = achievementsEntry.updateAchievementsValidation({ id: req.params.id, ...req.body });
      if(error) {
        return res.status(400).json({
          error: true,
          statusCode: 422,
          message: error.details[0].message,
        });
      }

      const { error:dataError, statusCode, message, validationErrors, data } = await updateAchievement(req.params.id, req.body, req.file);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
          validationErrors
        });
      }

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        data,
      });

    } catch (error) {
      logger.error(`${messages.achievements.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  async deleteAchievement(req,res) {
    try {

      const { error } = idEntry.findOneValidation({ id:req.params.id }, messages.achievements.fields.id);
      if(error) {
        return res.status(400).json({
          error: true,
          statusCode: 422,
          message: error.details[0].message
        });
      }

      const { error:dataError, statusCode, message } = await deleteAchievement(req.params.id);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message
        });
      }

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message
      });

    } catch (error) {
      logger.error(`${messages.achievements.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  async assign(req,res) {
    try {

      const { error } = achievementsEntry.patientAchievementValidation(req.body);
      if(error) {
        return res.status(400).json({
          error: true,
          statusCode: 422,
          message: error.details[0].message
        });
      }

      const { error:dataError, statusCode, message, data } = await assignAchievement(req.body, req.payload);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
        });
      }

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        data,
      });

    } catch (error) {
      logger.error(`${messages.achievements.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  async unassign(req,res) {
    try {

      const { error } = achievementsEntry.patientAchievementValidation(req.body);
      if(error) {
        return res.status(400).json({
          error: true,
          statusCode: 422,
          message: error.details[0].message
        });
      }

      const { error: dataError, statusCode, message } = await unassignAchievement(req.body);

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message
      });

    } catch(error) {
      logger.error(`${messages.achievements.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  }

}
