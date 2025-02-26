const { TeaDegree } = require('@models/index');
const logger = require('@config/logger.config');
const { messages } = require('@utils/index');

module.exports = {

  async all() {
    try {
      
      const data = await TeaDegree.findAll({
        attributes: {
          exclude: ['createdAt','updatedAt']
        }
      });

      if(!data) {
        return {
          error: true,
          statusCode: 200,
          message: messages.teaDegree.errors.service.all,
        }
      }

      return {
        error: false,
        statusCode: 200,
        message: messages.teaDegree.success.all,
        data,
      }
    } catch (error) {
      logger.error(`${messages.teaDegree.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  }

}