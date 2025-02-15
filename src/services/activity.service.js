const { Activity, Phase, PatientActivity, Patient, sequelize } = require('@models/index');
const logger = require('@config/logger.config');
const { 
  formatErrorMessages, 
  messages,
  dataStructure 
} = require('@utils/index');
const { 
  validatePictogram,
  getPictograms 
} = require('@helpers/activity.helper');


module.exports = {

  async all() {
    try {

      const data = await Activity.findAll({
        where: {
          status: true,
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','phaseId', 'pictogramSentence']
        },
        include: [
          {
            model: Phase,
            attributes: ['id', 'name', 'description'],
          },
          {
            model: PatientActivity,
            attributes: ['id'],
            include: [
              {
                model: Patient,
                attributes: ['id'],
              }
            ]
          }
        ]
      });

      if(!data) {
        return {
          error: true,
          statusCode: 404,
          message: messages.activity.errors.service.all,
        }
      };

      return {
        error: false,
        statusCode: 200,
        message: messages.activity.success.all,
        data: dataStructure.activityDataStructure(data),
      };

    } catch (error) {
      logger.error(`${messages.activity.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },


  async findOne(id) {
    try {
      
      const data = await Activity.findOne({
        where: {
          id,
          status: true,
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','phaseId']
        },
        include: [
          {
            model: Phase,
            attributes: ['id', 'name', 'description'],
          },
          {
            model: PatientActivity,
            attributes: ['id'],
            include: [
              {
                model: Patient,
                attributes: ['id'],
              }
            ]
          }
        ]
      });

      if(!data) {
        return {
          error: true,
          statusCode: 404,
          message: messages.activity.errors.not_found,
        }
      }

      const { error:pictogramError, message:pictogramMessage, pictograms } = await getPictograms(data.pictogramSentence);

      if(pictogramError) {
        return {
          error: pictogramError,
          statusCode: 404,
          message: pictogramMessage,
        }
      };

      data.setDataValue('pictograms', pictograms);

      return {
        error: false,
        statusCode: 200,
        message: messages.activity.success.found,
        data: dataStructure.findActivityDataStructure(data),
      };

    } catch (error) {
      logger.error(`${messages.activity.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

  async create({ name, description, satisfactoryPoints, pictogramSentence, phaseId }) {
    const transaction = await sequelize.transaction();
    try {

      // validate if name already exist
      const activityNameExist = await Activity.findOne({
        where: {
          name,
          status: true
        }
      });
      if(activityNameExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('name', messages.activity.errors.in_use.name),
        };
      }

      // validate if description already exist
      const activityDescriptionExist = await Activity.findOne({
        where: {
          description,
          status: true
        }
      });
      if(activityDescriptionExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('description', messages.activity.errors.in_use.description),
        };
      }

      // Validate if Phase exist
      const phaseExist = await Phase.findByPk(phaseId);
      if(!phaseExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('phaseId', messages.phase.errors.not_found),
        };
      }

      // validate if pictogramSentence has a valid pictograms
      const { error, message, statusCode, validationErrors } = await validatePictogram(pictogramSentence);
      if(error) {
        await transaction.rollback();
        return {
          error,
          statusCode,
          message,
          validationErrors,
        }
      }

      const formatPictogramSentence = pictogramSentence.join('-');


      // Create Activity
      const data = await Activity.create({
        name,
        description,
        satisfactoryPoints,
        pictogramSentence: formatPictogramSentence,
        phaseId
      },{transaction});

      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('create', messages.activity.errors.service.create),
        };
      }

      // Commit transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 201,
        message: messages.activity.success.create,
        data
      };

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.activity.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },



  async assingActivityPatient({ activityId, patientId, satisfactoryAttempts }) {
    const transaction = await sequelize.transaction();
    try {

      // Activity exist validation
      const activityExist = await Activity.findOne({
        where: {
          id: activityId,
          status: true
        }
      });
      if(!activityExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('activity', messages.activity.errors.not_found),
        }
      }
      
      // Patient exist validation
      const patientExist = await Patient.findOne({
        where: {
          id: patientId,
          status: true
        }
      });
      if(!patientExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('patient', messages.patient.errors.not_found),
        }
      }

      // Activity Patient Exist
      const activityPatientExist = await PatientActivity.findOne({
        where: {
          activityId,
          patientId,
          status: true
        }
      });
      if(activityPatientExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('activityPatient', messages.activity.errors.in_use.activityPatient),
        }
      }

      // Validate if patient has another activity assigned.
      const patientActivityAssigned = await PatientActivity.findOne({
        where: {
          patientId,
          isCompleted: false,
          status: true,
        }
      });

      if(patientActivityAssigned) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('activityPatient', messages.activity.errors.in_use.patientActivityAssigned),
        }
      }

      const data = await PatientActivity.create(
        {
          activityId,
          patientId,
          satisfactoryAttempts
        },
        { transaction }
      );

      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('create', messages.activity.errors.service.create),
        }
      }

      // Commit transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 201,
        message: messages.activity.success.assigned,
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.activity.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  }

}