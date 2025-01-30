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

      return res.status(200).json({
        error,
        statusCode: 200,
        message,
        data,
      });

    } catch (error) {
      logger.error(`${messages.teaDegree.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        message: `${messages.teaDegree.errors.controller}: ${error}`,
        statusCode: 500
      })
    }
  }

}