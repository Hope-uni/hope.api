const logger = require('@config/logger.config');
const { messages, formatJoiMessages } = require('@utils');
const {
  addObservation
} = require('@services/observations.service');
const {
  observationEntry
} = require('@validations');


module.exports = {

  async addPatientObservation(req,res) {
    try {

      const { error } = observationEntry.addObservationValidation(req.body);
      if (error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error: dataError, statusCode, message, validationErrors, data } = await addObservation(req.body, req.payload);

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
        data
      });

    } catch(error) {
      logger.error(`${messages.observations.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  }

}
