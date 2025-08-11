const { Phase, Patient, HealthRecord, TeaDegree, PatientActivity,Activity, Observation, Achievement, HealthRecordPhase } = require('@models/index');
const logger = require('@config/logger.config');
const { messages } = require('@utils');



/* eslint-disable radix */
/*
  getProgress method that retrieve: generalProgress, phaseProgress and the phase achievement.
  the last data is get it each time the system change the phase.
  In case the geProgress method is not used it in phaseShifting endpoint the lastPhaseAchievement parameter will always be "false"
*/
const getProgress = async (patientId, lastPhaseAchievement = false) => {
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
            exclude: ['createdAt', 'updatedAt', 'status', 'patientId']
          },
          include: [
            {
              model: TeaDegree,
              attributes: {
                exclude: ['createdAt', 'updatedAt'],
              }
            },
            {
              model: Phase,
              attributes: {
                exclude: ['createdAt', 'updatedAt'],
              },
              include: {
                model: Achievement
              }
            },
            {
              model: Observation,
              attributes: {
                exclude: ['createdAt', 'updatedAt', 'status', 'userId', 'healthRecordId'],
              }
            },
            {
              model: HealthRecordPhase,
            }
          ],
        }
      ],
    });

    if (!patientData) {
      return {
        error: true,
        message: messages.patient.errors.not_found,
        statusCode: 404
      }
    }

    /*
       get all the phases and their phase achievements, due to get the achievement that belongs to last phase completed by the patient
    */
    const phaseData = await Phase.findAndCountAll({
      distinct: true,
      order: [['id', 'ASC']],
      include: {
        model: Achievement
      }
    });

    if (!phaseData) {
      return {
        error: true,
        message: messages.healthRecord.errors.not_found,
        statusCode: 404
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

      // get the current phase and validate if is completed
      const isCompleted = patientData.HealthRecord.HealthRecordPhases.find((item) => item.phaseId === patientData.HealthRecord.Phase.id);

      if (Number((phaseIndex + 1)) === Number(totalPhases) && patientData.HealthRecord.HealthRecordPhases && isCompleted.phaseCompleted === true) {
        generalProgress = (100).toFixed(2);
      } else {
        generalProgress = parseFloat(((phaseIndex) / totalPhases) * 100).toFixed(2); // general progress value
      }
    }

    // Phase progress value
    /* eslint-disable radix */
    phaseProgress = ((parseInt(countActivitiesCompleted.count) / parseInt(phaseData.rows[phaseIndex].scoreActivities)) * 100).toFixed(2);

    // Get last phase achievement data in case this method (getProgress) is used it in phaseShifting endpoint
    let patientPhaseProgressData
    if(lastPhaseAchievement && phaseIndex !== 0) {
      patientPhaseProgressData = {
        id: phaseData.rows[phaseIndex].id,
        name: phaseData.rows[phaseIndex].name,
        description: phaseData.rows[phaseIndex].description,
        achievement: {
          id: phaseData.rows[phaseIndex - 1].Achievement.id,
          name: phaseData.rows[phaseIndex - 1].Achievement.name,
          imageUrl: phaseData.rows[phaseIndex - 1].Achievement.imageUrl,
        }
      }
    }

    return {
      error: false,
      generalProgress,
      phaseProgress,
      patientPhase: patientPhaseProgressData,
    }
  } catch (error) {
    logger.error(`${messages.phase.errors.helper}: ${error}`);
    return {
      error: true,
      message: `${messages.phase.errors.helper}: ${error}`,
      statusCode: 500
    }
  }
};

module.exports = {
  getProgress
}
