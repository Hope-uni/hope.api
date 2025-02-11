const logger = require('@config/logger.config');
const { messages } = require('@utils/index');
const { all } = require('@services/teaDegree.service');



module.exports = {

  async allTeaDegrees(req, res) {
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
        data,
      });

    } catch (error) {
      logger.error(`${messages.teaDegree.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      })
    }
  }

}