const logger = require('@config/logger.config');
const { messages, formatJoiMessages } = require('@utils/index');
const { phaseEntry } = require('@validations/index');
const {
  all,
  update,
} = require('@services/phase.service');



module.exports = {

  async allPhases(req,res) {
    try {
      
      const { error, statusCode, message, data } = await all();

      if(error) {
        return res.status(statusCode).json({
          error,
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
      logger.error(`${messages.phase.errors.controller}:${error}`);
      return res.status(500).json({
        error,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  async udpatePhase(req,res) {
    try {
      
      const { error } = phaseEntry.updatePhaseValidation({
        id: req.params.id,
        ...req.body
      });
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error: dataError, message, statusCode, validationErrors, data } = await update(req.params.id, req.body);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
          validationErrors
        });
      };

      return res.status(statusCode).json({
        error:dataError,
        statusCode,
        message,
        data
      })

    } catch (error) {
      logger.error(`${messages.phase.errors.controller}:${error}`);
      return res.status(500).json({
        error,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  }

}