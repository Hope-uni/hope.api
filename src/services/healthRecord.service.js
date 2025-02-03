const { HealthRecord, Patient, TeaDegree, Phase, sequelize } = require('@models/index');
const logger = require('@config/logger.config');
const {
  messages,
} = require('@utils/index');
const {
  createHealthRecordPhase
} = require('@services/healthRecordPhase.service');

module.exports = {

  async createHealthRecord(body, transactionRetrieved) {
    const transaction = transactionRetrieved ?? await sequelize.transaction();
    try {
      
      // Destructuring data
      const {
        description = '',
        teaDegreeId,
        phaseId,
        patientId,
      } = body;

      // TeaDegree Exist validation
      const teaDegreeExist = await TeaDegree.findOne({
        where: {
          id: teaDegreeId
        }
      });
      if(!teaDegreeExist) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.teaDegree.errors.not_found,
          statusCode: 404
        };
      };

      // Phase Exist validation
      const phaseExist = await Phase.findOne({
        where: {
          id: phaseId,
          status: true,
        }
      });
      if(!phaseExist) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.phase.errors.not_found,
          statusCode: 404
        };
      };

      // Patient Exist validation
      if(!transactionRetrieved) {
        const patientExist = await Patient.findOne({
          where: {
            id: patientId,
            status: true,
          }
        });
        if(!patientExist) {
          await transaction.rollback();
          return {
            error: true,
            message: messages.patient.errors.not_found,
            statusCode: 404
          };
        };
      }

      // Create a healthRecord
      const healthRecordCreated = await HealthRecord.create({
        description,
        phaseId,
        teaDegreeId: teaDegreeExist.id,
        patientId
      }, {transaction});

      if(!healthRecordCreated) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 400,
          message: `${messages.healthRecord.errors.service.create}`,
        }
      }


      // Assign phase to healthRecord
      const assignPhaseBody = {
        healthRecordId: healthRecordCreated.id,
        phaseId
      }
      const { error: dataError, message, statusCode } = await createHealthRecordPhase(assignPhaseBody, transaction);

      if(dataError) {
        await transaction.rollback();
        return {
          error: dataError,
          message,
          statusCode
        }
      }

      if(transactionRetrieved) {
        return {
          error: false,
          message: messages.healthRecord.success.create,
          healthRecordCreated,
        }
      }

      await transaction.commit();

      return {
        error: false,
        message: messages.healthRecord.success.create,
        healthRecordCreated,
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.healthRecord.errors.service.base}: ${error}`);
      return {
        error: true,
        message: `${messages.healthRecord.errors.service.base}: ${error}`,
        statusCode: 500
      }
    }
  }

}