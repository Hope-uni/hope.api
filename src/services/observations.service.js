const { Observation, User, HealthRecord, sequelize } = require('@models/index');
const logger = require('@config/logger.config');
const { messages, formatErrorMessages } = require('@utils/index');

module.exports = {

  async createObservation (body, transactionRetrieved) {
    const transaction = transactionRetrieved ?? await sequelize.transaction();
    try {

      // Destructuring Object
      const { description, userId, healthRecordId } = body;

      // Validate if user exist
      if(!transactionRetrieved) {
        const userExist = await User.findByPk(userId);
        if(!userExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 404,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('user', messages.user.errors.not_found),
          }
        }
        // Validate if healthRecord exist
        const healthRecordExist = await HealthRecord.findByPk(healthRecordId);
        if(!healthRecordExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 404,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('healthRecord', messages.healthRecord.errors.not_found),
          }
        }
      }


      const data = await Observation.create({
        description,
        userId,
        healthRecordId
      },{transaction});

      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('create', messages.observations.errors.service.create),
        }
      }

      if(transactionRetrieved) {
        return {
          error: false,
          statusCode: 200,
          message: messages.observations.success.create,
          data
        }
      }

      // Commit transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.observations.success.create,
        data
      };
    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.observations.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  }

}