const { Phase, PatientActivity, HealthRecord, sequelize } = require('@models/index');
const { Op } = require('sequelize');
const logger = require('@config/logger.config');
const { messages, formatErrorMessages } = require('@utils');
const { patientBelongsToTherapist } = require('@helpers');

module.exports = {

  async all() {
    try {

      const data = await Phase.findAll({
        where: {
          status: true,
        },
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'status']
        }
      });

      if(!data) {
        return {
          statusCode: 404,
          error: true,
          message: messages.phase.errors.service.all,
        }
      }

      return {
        statusCode: 200,
        error: false,
        message: messages.phase.success.all,
        data,
      }
    } catch (error) {
      logger.error(`${messages.phase.errors.service.base}: ${error}`);
      return {
        statusCode: 500,
        error: true,
        message: messages.generalMessages.server,
      }
    }
  },


  async update(id, body) {
    const transaction = await sequelize.transaction();
    try {


      // Phase Exist
      const phaseExist = await Phase.findByPk(id);
      if(!phaseExist) {
        await transaction.rollback();
        return {
          statusCode: 404,
          error: true,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('phase', messages.phase.errors.not_found),
        }
      }

      // name exist validation
      if(body.name) {
        const nameExist = await Phase.findOne({
          where: {
            name: body.name,
            status: true,
            id: {
              [Op.ne]: id,
            }
          },
        });

        if(nameExist) {
          await transaction.rollback();
          return {
            statusCode: 409,
            error: true,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('name', messages.phase.errors.in_use.name),
          }
        }
      };

      // Update Phase
      const udpatePhaseResponse = await Phase.update(
        {
          ...body
        },
        {
          where: {
            id,
          },
          transaction
        }
      );

      if(!udpatePhaseResponse) {
        await transaction.rollback();
        return {
          statusCode: 409,
          error: true,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('update', messages.phase.errors.service.update),
        }
      };

      // Commit transaction
      await transaction.commit();

      // Get phase data updated
      const data = await Phase.findOne({
        where: {
          id
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        }
      });


      return {
        error: false,
        statusCode: 200,
        message: `${messages.phase.success.update}`,
        data,
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.phase.errors.service.base}: ${error}`);
      return {
        statusCode: 500,
        error: true,
        message: messages.generalMessages.server,
      }
    }
  },

  async phaseShifting({ patientId }, payload) {
    const transaction = await sequelize.transaction();
    try {

      const { error:verifyPatientError, message:verifyPatientMessage, statusCode: verifyPatientStatus, patientExist } = await patientBelongsToTherapist(payload, patientId,transaction);

      if(verifyPatientError) {
        await transaction.rollback();
        return {
          error: verifyPatientError,
          statusCode: verifyPatientStatus,
          message: verifyPatientMessage
        }
      }

      // Verify if the patient has activities assigned incompleted.
      const hasActivityAssigned = await PatientActivity.findOne({
        where: {
          patientId: patientExist.id,
          isCompleted: false,
          status: true,
        }
      });

      if(hasActivityAssigned) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.phase.errors.service.has_activity
        }
      }

      // Valdiate if phase exist
      const phaseExist = await Phase.findAll({
        where: {
          status: true,
        },
        order:[['id', 'ASC']],
      });

      // Validate next phase order
      const getCurrentPhaseIndex = phaseExist.findIndex(item => item.id === patientExist.HealthRecord.phaseId);

      // Verify if the patient has complied with the phases scoreActivities.
      const countActivitiesCompleted = await PatientActivity.findAndCountAll({
        where: {
          patientId: patientExist.id,
          isCompleted: true,
          status: true,
        }
      });

      /* eslint-disable radix */
      if (parseInt(countActivitiesCompleted.count) < parseInt(phaseExist[getCurrentPhaseIndex].scoreActivities)) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.activity.errors.service.incomplete_phase_score
        }
      }

      // Update Patient in order to change his phase
      const data = await HealthRecord.update({
        phaseId: phaseExist[getCurrentPhaseIndex + 1].id
      }, {
        where: {
          patientId: patientExist.id,
        },
        transaction
      });

      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.phase.errors.service.phase_changed
        }
      }

      // Commit transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.phase.success.phase_changed
      }

    } catch(error) {
      await transaction.rollback();
      logger.error(`${messages.phase.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      }
    }
  }

}
