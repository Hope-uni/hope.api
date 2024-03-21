const logger = require('@config/logger.config');
const {
  all
} = require('@services/therapist.service');

module.exports = {

  async all(req,res) {
    try {
      
      const { error, message, statusCode, ...resData } = await all(req.query);

      if(error) {
        return res.status(statusCode).json({
          error,
          message
        });
      };

      return res.status(200).json({
        error,
      ...resData
      });

    } catch (error) {
      logger.error(`There was an error in Therapist controller: ${error}`);
      return res.status(500).json({
        error: true,
        message: `There was an error in Therapist controller: ${error}`
      }); 
    }
  }

}