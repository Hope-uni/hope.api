const { User, HealthRecord, Patient, UserRoles, TutorTherapist, Phase } = require('@models/index');
const logger = require('@config/logger.config');
const constants = require('@constants/role.constant');
const { messages } = require('@utils');


const patientBelongsToTherapist = async (payload, patientId, transaction) => {
  try {

    // Variables
    let whereCondition = {
      id: patientId,
      status: true,
    }

    if(payload.roles.includes(constants.THERAPIST_ROLE)) {
      // validate if therapist exist
      const therapistExist = await TutorTherapist.findOne({
        where: {
          userId: payload.id
        },
        include:[
          {
            model: User,
            include: [
              {
                model: UserRoles,
                where: {
                  roleId: 3
                }
              }
            ]
          }
        ]
      });

      if(!therapistExist) {
        return {
          error: true,
          statusCode: 404,
          message: messages.therapist.errors.not_found
        }
      }

      // add the therapistId key just for validate if the patient belongs to the therapist
      whereCondition = {
        ...whereCondition,
        therapistId: therapistExist.id
      }
    }

    // validate if patient exist
    const patientExist = await Patient.findOne({
      where: whereCondition,
      include: [
        {
          model: User,
          where: {
            status: true,
          }
        },
        {
          model: HealthRecord,
          where: {
            patientId
          },
          include: [
            {
              model: Phase,
            }
          ]
        }
      ]
    });

    if(!patientExist) {
      return {
        error: true,
        statusCode: 404,
        message: messages.patient.errors.not_found
      }
    }

    return {
      error: false,
      statusCode: 200,
      patientExist
    }
  } catch(error) {
    logger.error(`${messages.obsevations.service.base}: ${error}`);
    await transaction.rollback();
    return {
      error: true,
      statusCode: 500,
      message: messages.generalMessages.server
    }
  }
}


module.exports = {
  patientBelongsToTherapist
}
