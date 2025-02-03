const { HealthRecordPhase, sequelize } = require('@models/index');
const logger = require('@config/logger.config');
const { messages } = require('@utils/index');

module.exports = {

  async createHealthRecordPhase (body, transactionRetrieved) {
    const transaction = transactionRetrieved ?? await sequelize.transaction();
    try {


      const { healthRecordId, phaseId,  phaseCompleted = false } = body;
      
      // Validate if there is the phase is already associated to this healthRecord.
      const healthRecordPhaseData = await HealthRecordPhase.findOne({
        where: {
          phaseId,
          healthRecordId,
        }
      });

      if(healthRecordPhaseData) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 400,
          message: `${messages.healthRecordPhase.errors.already_exist}`,
        }
      }

      // Join phas to healthRecord
      const data = await HealthRecordPhase.create({
        healthRecordId,
        phaseId,
        phaseCompleted,
      }, {transaction});

      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 400,
          message: `${messages.healthRecordPhase.errors.service.create}`,
        }
      }

      if(transactionRetrieved) {
        return {
          error: false,
          message: messages.healthRecordPhase.success.create,
          data
        }
      }

      await transaction.commit();

      return {
        error: false,
        message: messages.healthRecordPhase.success.create,
        data
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.healthRecordPhase.errors.service.base}: ${error}`);
      return {
        error: true,
        message: `${messages.healthRecordPhase.errors.service.base}: ${error}`,
        statusCode: 500
      }
    }
  }

}