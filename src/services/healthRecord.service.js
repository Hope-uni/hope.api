const { HealthRecord, Patient, TeaDegree, Phase, TutorTherapist, User, sequelize } = require('@models/index');
const logger = require('@config/logger.config');
const {
  createHealthRecordPhase
} = require('@services/healthRecordPhase.service');
const {
  messages,
  formatErrorMessages
} = require('@utils');
const { roleConstants:constants } = require('@constants');

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
  },

  async changeMonochromePatient(patientId,payload) {
    const transaction = await sequelize.transaction();
    try {

      // Variables
      let patientWhereCondition = {
        status: true,
        id:patientId
      };

      if(payload.roles.includes(constants.TUTOR_ROLE)) {
        const tutorExist = await TutorTherapist.findOne({
          where: {
            userId: payload.id
          },
          include:{
            model: User,
            where: {
              status: true,
            }
          }
        });
        if(!tutorExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 404,
            message: messages.tutor.errors.not_found,
          }
        }

        patientWhereCondition = {
          ...patientWhereCondition,
          tutorId: tutorExist.id
        }
      };

      // Validate if patient Exist
      const patientExist = await Patient.findOne({
        where: patientWhereCondition,
        include: [
          {
            model: User,
            where: {
              status: true,
            }
          },
          {
            model: HealthRecord,
            attributes: {
              exclude: ['createdAt','updatedAt','status','patientId']
            },
          }
        ]
      });

      if(!patientExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.patient.errors.patient_assigned
        }
      }

      // Update Monochrome endpoint.
      const data = await HealthRecord.update({
        isMonochrome: !patientExist.HealthRecord.isMonochrome
      }, {
        where: {
          patientId: patientExist.id
        },
        transaction,
        returning: true,
      });

      if (!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.healthRecord.errors.service.monochrome
        }
      }

      // Commit transaction.
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.healthRecord.success.monochrome,
        data: {
          isMonochrome: data[1][0].isMonochrome
        }
      }
    } catch(error) {
      await transaction.rollback();
      logger.error(`${messages.healthRecord.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      }
    }
  }

}
