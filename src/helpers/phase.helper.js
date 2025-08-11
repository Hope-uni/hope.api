const { AchievementsHealthRecord, HealthRecordPhase } = require('@models/index');
const logger = require('@config/logger.config');
const { messages, dataStructure } = require('../utils');



/*
  This method is for all patients with last level of pecs methodology, when the phaseShifting endpoint is requested and the patient is in this final level
  the only thing that we need to do is add the current phase achievement to his healthRecord.
*/
const lastLevelHelper = async (patientExist, transaction) => {
  try {
    // Add phase achievement to AchievementHealthRecord
    const addNewAchivementToPatient = await AchievementsHealthRecord.create({
      healthRecordId: patientExist.HealthRecord.id,
      achievementId: patientExist.HealthRecord.Phase.achievementId
    }, { transaction });

    if (!addNewAchivementToPatient) {
      logger.error(`There was an error in phaseShifting: phase achievement was not add to AchievementsHealthRecord.`);
      await transaction.rollback();
      return {
        error: true,
        statusCode: 409,
        message: messages.phase.errors.service.phase_changed
      }
    }

    // Update HealthRecordPhase for change the phaseCompleted to true before create new HealthRecordPhase
    const updateHealthRecordPhaseResponse = await HealthRecordPhase.update({
      phaseCompleted: true,
    },{
      where: {
        healthRecordId: patientExist.HealthRecord.id,
        phaseId: patientExist.HealthRecord.Phase.id,
      },
      transaction
    });

    if(!updateHealthRecordPhaseResponse) {
      logger.error(`There was an error in phaseShifting: the current HealthRecordPhase was not update with the phaseCompleted to TRUE`);
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
      message: messages.phase.success.last_phase_completed,
      data: dataStructure.phaseShiftingDataStructure({
        phase: {
          id: patientExist.HealthRecord.Phase.id,
          name: patientExist.HealthRecord.Phase.name,
          description: patientExist.HealthRecord.Phase.description,
          achievement: {
            id: patientExist.HealthRecord.Phase.Achievement.id,
            name: patientExist.HealthRecord.Phase.Achievement.name,
            imageUrl: patientExist.HealthRecord.Phase.Achievement.imageUrl,
          }
        },
        generalProgress: 100,
        phaseProgress: 100,
      })
    }


    // get the phase
  } catch (error) {
    await transaction.rollback();
    logger.error(`${messages.phase.errors.service.base}: ${error}`);
    return {
      error: true,
      statusCode: 500,
      message: messages.generalMessages.server
    }
  }
};


module.exports = {
  lastLevelHelper,
}
