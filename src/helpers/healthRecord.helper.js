const { Phase, Patient, HealthRecord, TeaDegree, Observation } = require('@models/index');
const logger = require('@config/logger.config');
const { messages } = require('@utils/index');



module.exports = {

  async getProgress(patientId) {
    try {

      // Getting patient information
      const patientData = await Patient.findOne({
        where: {
          id: patientId,
          status: true,
        },
        include: [
          {
            model: HealthRecord,
            attributes: {
              exclude: ['createdAt','updatedAt','status','patientId']
            },
            include: [
              {
                model: TeaDegree,
                attributes: {
                  exclude: ['createdAt','updatedAt'],
                }
              },
              {
                model: Phase,
                attributes: {
                  exclude: ['createdAt','updatedAt'],
                }
              },
              {
                model: Observation,
                attributes: {
                  exclude: ['createdAt','updatedAt', 'status', 'userId', 'healthRecordId'],
                }
              }
            ],
          }
        ],
      });

      if(!patientData) {
        return {
          error: true,
          message: messages.patient.errors.not_found,
          statusCode: 404
        }
      }
      
      const data = await Phase.findAndCountAll({
        distinct: true,
        order: [['id', 'ASC']]
      });

      if(!data) {
        return {
          error: true,
          message: messages.healthRecord.errors.not_found,
          statusCode: 404
        }
      }

      // Building the percentage
      const totalPhases = data.count;
      let phaseIndex = 0;
      let generalProgress = 0;

      if(patientData.HealthRecord !== null && patientData.HealthRecord.Phase !== null) {
        phaseIndex = data.rows.findIndex(item => item.id === patientData.HealthRecord.Phase.id);

        generalProgress = parseFloat(((phaseIndex + 1) / totalPhases) * 100).toFixed(2);
      }

      return {
        error: false,
        generalProgress,
      }

    } catch (error) {
      logger.error(`${messages.phase.errors.helper}: ${error}`);
      return {
        error: true,
        message: `${messages.phase.errors.helper}: ${error}`,
        statusCode: 500
      }
    }
  }

}