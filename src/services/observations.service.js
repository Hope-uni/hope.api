const { Observation, User, HealthRecord, sequelize } = require('@models/index');
const logger = require('@config/logger.config');
const { patientBelongsToTherapist } = require('@helpers');
const { messages, formatErrorMessages, dataStructure } = require('@utils');

const createObservation = async (body, transactionRetrieved) => {
    const transaction = transactionRetrieved ?? await sequelize.transaction();
    try {

      // Destructuring Object
      const { description, userId, healthRecordId } = body;

      // Validate if user exist
      if(!transactionRetrieved) {
        const userExist = await User.findByPk(userId);
        if(!userExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 404,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('user', messages.user.errors.not_found),
          }
        }
        // Validate if healthRecord exist
        const healthRecordExist = await HealthRecord.findByPk(healthRecordId);
        if(!healthRecordExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 404,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('healthRecord', messages.healthRecord.errors.not_found),
          }
        }
      }


      const data = await Observation.create({
        description,
        userId,
        healthRecordId
      },{transaction});

      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('create', messages.observations.errors.service.create),
        }
      }

      if(transactionRetrieved) {
        return {
          error: false,
          statusCode: 200,
          message: messages.observations.success.create,
          data
        }
      }

      // Commit transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.observations.success.create,
        data
      };
    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.observations.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
};


const addObservation = async ({ description, patientId }, payload) => {
  const transaction = await sequelize.transaction();
  try {

    const { error:verifyPatientError, message:verifyPatientMessage, statusCode: verifyPatientStatus, patientExist } = await patientBelongsToTherapist(payload, patientId);

    if(verifyPatientError) {
      await transaction.rollback();
      return {
        error: verifyPatientError,
        statusCode: verifyPatientStatus,
        message: messages.generalMessages.base,
        validationErrors: formatErrorMessages('patient', verifyPatientMessage)
      }
    }

    // Validate if the obsevation has been added.
    const descriptionExist = await Observation.findOne({
      where: {
        description,
        status: true,
      },
      include: [
        {
          model: HealthRecord,
          where: {
            patientId: patientExist.id
          },
        }
      ]
    });

    if(descriptionExist) {
      await transaction.rollback();
      return {
        error: true,
        statusCode: 409,
        message: messages.generalMessages.base,
        validationErrors: formatErrorMessages('description', messages.observations.errors.service.description)
      }
    }

    // Create Observation
    const { error, statusCode, message, data } = await createObservation({
      description,
      userId: payload.id,
      healthRecordId: patientExist.HealthRecord.id
    }, transaction);

    if(error) {
      return {
        error,
        statusCode,
        message: messages.generalMessages.base,
        validationErrors: formatErrorMessages('create', messages.observations.errors.service.create)
      }
    }

    // Commit transaction
    await transaction.commit();

    // get observation
    const getNewObservation = await Observation.findOne({
      where: {
        id: data.id,
        status: true,
      },
      include: {
        model: User,
      }
    });


    if(!getNewObservation) {
      return {
        error: true,
        statusCode: 404,
        message: messages.generalMessages.base,
        validationErrors: formatErrorMessages('Observation', messages.observations.errors.not_found)
      }
    }

    return {
      error,
      statusCode,
      message,
      data: dataStructure.findObservationDataStructure(getNewObservation)
    }
  } catch(error) {
    await transaction.rollback();
    logger.error(`${messages.observations.errors.service.base}: ${error}`);
    return {
      error: true,
      statusCode: 500,
      message: messages.generalMessages.server
    }
  }
}


module.exports = {
  createObservation,
  addObservation
}
