const { Phase, Patient, HealthRecord, TeaDegree, PatientActivity,Activity, Observation, Achievement, HealthRecordPhase } = require('@models/index');
const logger = require('@config/logger.config');
const { messages } = require('@utils');



module.exports = {

  /* eslint-disable radix */
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
                },
                include: {
                  model: Achievement
                }
              },
              {
                model: Observation,
                attributes: {
                  exclude: ['createdAt','updatedAt', 'status', 'userId', 'healthRecordId'],
                }
              },
              {
                model: HealthRecordPhase,
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

      const phaseData = await Phase.findAndCountAll({
        distinct: true,
        order: [['id', 'ASC']]
      });

      if(!phaseData) {
        return {
          error: true,
          message: messages.healthRecord.errors.not_found,
          statusCode: 404
        }
      }

      /* Building the percentage */
      let generalProgress = 0;
      let phaseProgress = 0;
      // General Progress
      const totalPhases = phaseData.count; // 6
      let phaseIndex = 0;

      if (patientData.HealthRecord !== null && patientData.HealthRecord.Phase !== null) {
        phaseIndex = phaseData.rows.findIndex(item => item.id === patientData.HealthRecord.Phase.id); // 0 1 2 3 4 5

        if (phaseIndex === 0) {
          generalProgress = 0
        }

        if ((phaseIndex + 1) === totalPhases && patientData.HealthRecord.HealthRecordPhase && patientData.HealthRecord.HealthRecordPhase.phaseCompleted === true) {
          generalProgress = 100;
        } else {
          generalProgress = parseFloat(((phaseIndex) / totalPhases) * 100).toFixed(2); // general progress value
        }

      }

      // Phase progress: phase progress is base in how many activities the patient has done in his current phase.
      const countActivitiesCompleted = await PatientActivity.findAndCountAll({
        where: {
          patientId: patientData.id,
          isCompleted: true,
          status: true,
        },
        include: [
          {
            model: Activity,
            where: {
              phaseId: patientData.HealthRecord.Phase.id
            }
          }
        ]
      });

      phaseProgress = ((parseInt(countActivitiesCompleted.count) / parseInt(phaseData.rows[phaseIndex].scoreActivities)) * 100).toFixed(2); // Phase progress value

      return {
        error: false,
        generalProgress,
        phaseProgress,
        patientPhase: patientData.HealthRecord.Phase,
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
