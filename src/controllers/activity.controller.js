const logger = require('@config/logger.config');
const { messages, formatJoiMessages } = require('@utils/index');
const { 
  activityEntry,
  idEntry, 
} = require('@validations/index');
const { 
  all,
  findOne, 
  create,
  assingActivityPatient 
} = require('@services/activity.service');



module.exports = {
  
  async allActivities(req,res) {
    try {
      
      const { error, message, statusCode, data } = await all();

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
      logger.error(`${messages.activity.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      });
    }
  },


  async findActivity(req,res) {
    try {
      
      const { error } = idEntry.findOneValidation({ id:req.params.id });
      if(error) return res.status(400).json({ 
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, statusCode, message, data } = await findOne(req.params.id);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message
        })
      };

      return res.status(statusCode).json({
        error:dataError,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.activity.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      });
    }
  },

  async createActivity(req,res) {
    try {
      
      const { error } = activityEntry.createActivityValidation(req.body);
      if(error) return res.status(400).json({ 
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error)
      });

      const { error:dataError, statusCode, message, validationErrors, data } = await create(req.body);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
          validationErrors,
        })
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.activity.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      });
    }
  },

  async assignActivity(req,res) {
    try {
      
      const { error } = activityEntry.assignActivityPatient(req.body);
      if(error) return res.status(400).json({ 
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, statusCode, message, validationErrors } = await assingActivityPatient(req.body);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
          validationErrors,
        })
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message
      });

    } catch (error) {
      logger.error(`${messages.activity.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      });
    }
  }

}