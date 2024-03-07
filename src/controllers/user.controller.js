const logger = require('@config/logger.config');
const {
  allUsers,
  findUser,
} = require('../services/user.service');


module.exports = {

  async all(req,res) {
    try {
      
      const { error, message, statusCode, ...resData } = await allUsers(req.query);

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
      logger.error(error);
      return res.status(500).json({
        message: `There was an error in User services: ${error}`,
        error: true
      });
    }
  },

  async findUser(req,res) {
    try {
      
      const { error, message, statusCode, data} = await findUser(req.params.id);
      if(error) {
        return res.status(statusCode).json({
          error,
          message
        })
      };

      return res.status(200).json({
        error,
        message,
        data
      });

    } catch (error) {
      logger.error(error);
      return res.status(500).json({
        message: `There was an error in User services: ${error}`,
        error: true
      });
    }
  },

  

}