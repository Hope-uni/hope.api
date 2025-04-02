const logger = require('@config/logger.config');
const { messages } = require('@utils');
const { changeMonochromePatient } = require('@services/healthRecord.service');
const { idEntry } = require('@validations');



module.exports = {

  async changeMonochrome(req,res) {
    try {

      const { error } = idEntry.findOneValidation({ id: req.params.id }, messages.patient.fields.id);
      if(error) {
        return res.status(400).json({
          error: true,
          statuCode: 422,
          message: error.details[0].message
        });
      }

      const { error:dataError, statusCode, message, data } = await changeMonochromePatient(req.params.id, req.payload);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message
        });
      }

      return res.status(statusCode).json({
        error:dataError,
        statusCode,
        message,
        data
      });

    } catch(error) {
      logger.error(`${messages.healthRecord.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      });
    }
  }

}
