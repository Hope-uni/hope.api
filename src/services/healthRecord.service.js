const { HealthRecord, Patient, TeaDegree, Phase, sequelize } = require('@models/index');
const logger = require('@config/logger.config');
const {
  messages,
  formatErrorMessages
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
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('teaDegree', messages.teaDegree.errors.not_found),
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
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('phase', messages.phase.errors.not_found),
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
            statusCode: 404,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('patient', messages.patient.errors.not_found),
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
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('create', messages.healthRecord.errors.service.create),
        }
      }


      // Assign phase to healthRecord
      const assignPhaseBody = {
        healthRecordId: healthRecordCreated.id,
        phaseId
      }
      const { error: dataError, message, validationErrors, statusCode } = await createHealthRecordPhase(assignPhaseBody, transaction);

      if(dataError) {
        await transaction.rollback();
        return {
          error: dataError,
          message,
          statusCode,
          validationErrors
        }
      }

      if(transactionRetrieved) {
        return {
          error: false,
          statusCode: 201,
          message: messages.healthRecord.success.create,
          healthRecordCreated,
        }
      }

      await transaction.commit();

      return {
        error: false,
        statusCode: 201,
        message: messages.healthRecord.success.create,
        healthRecordCreated,
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.healthRecord.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  }

}