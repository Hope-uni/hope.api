const { Op } = require('sequelize');
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


  async updateActivity(id,body) {
    const transaction = await sequelize.transaction();
    try {
      
      // Activity exist validation
      const activityExist = await Activity.findOne({
        where: {
          id,
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
      
      // Name exist validation
      if(body.name) {
        const nameExist = await Activity.findOne({
          where: {
            name: body.name,
            status: true,
            id: {
              [Op.ne]: id
            }
          }
        });
        if(nameExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('name', messages.activity.errors.in_use.name),
          }
        }
      }
      
      // Description exist validation
      if(body.description) {
        const descriptionExist = await Activity.findOne({
          where: {
            description: body.description,
            status: true,
            id: {
              [Op.ne]: id
            }
          }
        });
        if(descriptionExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('description', messages.activity.errors.in_use.description),
          } 
        }
      }
      
      // Pictograms exist validation
      /* eslint-disable no-param-reassign */
      if(body.pictogramSentence) {


        // validate if pictogramSentence has a valid pictograms
        const { error, message, statusCode, validationErrors } = await validatePictogram(body.pictogramSentence);
        if(error) {
          await transaction.rollback();
          return {
            error,
            statusCode,
            message,
            validationErrors,
          }
        }

        const pictogramSentenceParsed = body.pictogramSentence.join('-');	// Make it string.
        const pictogramsExist = await Activity.findOne({
          where: {
            pictogramSentence: pictogramSentenceParsed,
            status: true,
            id: {
              [Op.ne]: id
            }
          }
        });
        if(pictogramsExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('pictogramSentence', messages.activity.errors.in_use.pictogramSentence),
          }
        }

        /// assign the joined pictograms
        body.pictogramSentence = pictogramSentenceParsed;
      };

      // Validate if phase exist
      if(body.phaseId) {
        const phaseExist = await Phase.findByPk(body.phaseId);
        if(!phaseExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 404,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('phaseId', messages.phase.errors.not_found),
          }
        }
      }
      
      // Update Activity
      const activityResponse = await Activity.update(
        {
          ...body,
        },
        {
          where: {
            id,
            status: true,
          }
        },
        {transaction}
      );
      if(!activityResponse) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('update', messages.activity.errors.service.update),
        }
      }
      
      // Commit transaction
      await transaction.commit();

      const newData = await Activity.findOne({
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
      
      return {
        error: false,
        statusCode: 200,
        message: messages.activity.success.update,
        data: dataStructure.findActivityDataStructure(newData),
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
  },


  async assingActivityPatient({ activityId, patientId }) {
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
          message: messages.activity.errors.not_found,
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
          message: messages.patient.errors.not_found,
        }
      }

      // Activity Patient Exist
      const activityPatientExist = await PatientActivity.findOne({
        where: {
          activityId,
          patientId,
          status: true,
        }
      });
      if(activityPatientExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.activity.errors.in_use.activityPatient,
        }
      }

      // Validate if activited is unassigned to this patient
      const verifyPatientActivityisUnassigned = await PatientActivity.findOne({
        where: {
          activityId,
          patientId,
          status: false,
        }
      });

      if(verifyPatientActivityisUnassigned) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 200,
          message: messages.activity.errors.in_use.patient_activity_unassigned,
        }
      }

      // Validate if activity is completed
      const activityCompleted = await PatientActivity.findOne({
        where: {
          activityId,
          patientId,
          isCompleted: true,
          status: true,
        }
      });

      if(activityCompleted) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.activity.errors.service.already_completed,
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
          validationErrors: formatErrorMessages('activityPatient', messages.activity.errors.in_use.patient_activity_assigned),
        }
      }

      const data = await PatientActivity.create(
        {
          activityId,
          patientId,
          satisfactoryAttempts: 0,
        },
        { transaction }
      );

      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.activity.errors.service.create
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
  },

  async reAssignActivity({ activityId, patientId, restore }) {
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
          message: messages.activity.errors.not_found,
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
          message: messages.patient.errors.not_found,
        }
      }


      // Verify if the activity is assigned to the patient
      const activityPatientExist = await PatientActivity.findOne({
        where: {
          activityId,
          patientId,
          status: false
        }
      });

      if(!activityPatientExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.activity.errors.service.patient_activity_not_assigned,
        }
      }

      // Validate if activity is completed
      const activityCompleted = await PatientActivity.findOne({
        where: {
          activityId,
          patientId,
          isCompleted: true,
          status: true,
        }
      });

      if(activityCompleted) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.activity.errors.service.already_completed,
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
          message: messages.patient_activity_assigned,
        }
      }

      // reassign the activity
      let reassignActivity;

      if(restore) {
        reassignActivity = await PatientActivity.update({
          status: true,
          satisfactoryAttempts: 0,
        },{
          where: {
            activityId,
            patientId,
            status: false,
          },
          transaction
        });  
      } else {
        reassignActivity = await PatientActivity.update({
          status: true,
        },{
          where: {
            activityId,
            patientId,
            status: false,
          },
          transaction
        });
      }


      if(!reassignActivity) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.activity.errors.service.reassign,
        }
      }

      // Commit transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.activity.success.reassign,
      }

    } catch (error) {
      logger.error(`${messages.activity.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

  async deleteActivity(id) {
    const transaction = await sequelize.transaction();
    try {
      
      // Activity exist validation
      const activityExist = await Activity.findOne({
        where: {
          id,
          status: true
        }
      });
      if(!activityExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.activity.errors.not_found,
        }
      }


      // Delete Activity
      const activityResponse = await Activity.update({
        status: false
      },{
        where: {
          id,
          status: true,
        },
        transaction
      });
      if(!activityResponse) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.activity.errors.service.delete,
        }
      }

      // change status of patientActivity to false corresponding to the activity
      const invalidPatientActivity = await PatientActivity.update({
        status: false
      },{
        where: {
          activityId: id,
          status: true,
        },
        transaction
      });
      if(!invalidPatientActivity) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.activity.errors.service.delete_patient_activity,
        }
      }

     // Commit transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.activity.success.delete,
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
  },

  async unAssignActivityPatient({ activityId, patientId }) {
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
          message: messages.activity.errors.not_found,
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
          message: messages.patient.errors.not_found,
        }
      }


      // Verify if the activity is assigned to the patient
      const activityPatientExist = await PatientActivity.findOne({
        where: {
          activityId,
          patientId,
          status: true
        }
      });

      if(!activityPatientExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.activity.errors.service.patient_activity_not_assigned,
        }
      }

      // Update Patient Activity changing status to false
      const changePatientActivityStatus = await PatientActivity.update({
        status: false
      },{
        where: {
          activityId,
          patientId,
          status: true
        },
        transaction
      });

      if(!changePatientActivityStatus) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.activity.errors.service.unassign_activity_patient,
        }
      }

      // Commit transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.activity.success.unassigned,
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
  },


  async checkActivityAnswer({ attempt, activityId, patientId }) {
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
          message: messages.activity.errors.not_found,
        }
      }

      // Patient exist validation
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
          message: messages.patient.errors.not_found,
        }
      }

      // validate if pictogramSentence has a valid pictograms
      const { error, message, statusCode, validationErrors } = await validatePictogram(attempt);
      if(error) {
        await transaction.rollback();
        return {
          error,
          statusCode,
          message,
          validationErrors,
        }
      }

      // Valdiate if the activity is associated with the patient previously retrieved
      const patientActivityExist = await PatientActivity.findOne({
        where: {
          activityId,
          patientId,
          status: true
        }
      });
      if(!patientActivityExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.activity.errors.service.patient_activity_not_found,
        }
      }

      // Validate if activity is completed
      const activityCompleted = await PatientActivity.findOne({
        where: {
          activityId,
          patientId,
          isCompleted: true,
          status: true,
        }
      });

      if(activityCompleted) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.activity.errors.service.already_completed,
        }
      }

      // get the pictogramSentence and check if this one match with the attempt
      const pictogramSentenceArray = activityExist.pictogramSentence.split('-').map(Number);

      // Check if the attempt is valid
      const isValidAttempt = pictogramSentenceArray.every((item, index) => attempt[index] === item );

      if(isValidAttempt === false) {
        return {
          error: true,
          statusCode: 409,
          message: messages.activity.errors.service.incorrect_answer,
        }
      }

      // Save the attempt as correct
      const newSatisfactoryAttemptAmount = patientActivityExist.satisfactoryAttempts + 1;

        // validate if satisfactoryAttempts is equal to satisfactoryPoints
        if(activityExist.satisfactoryPoints === newSatisfactoryAttemptAmount) {

          const saveAttemptAsCorrect = await PatientActivity.update({
            satisfactoryAttempts: newSatisfactoryAttemptAmount,
            isCompleted: true,
          },{
            where: {
              activityId,
              patientId,
              status: true,
            },
            transaction
          });
        
          if(!saveAttemptAsCorrect) {
            await transaction.rollback();
            return {
              error: true,
              statusCode: 409,
              message: messages.activity.errors.service.check_attempt,
            }
          }
        
        }

      const saveAttemptAsCorrect = await PatientActivity.update({
        satisfactoryAttempts: newSatisfactoryAttemptAmount,
      },{
        where: {
          activityId,
          patientId,
          status: true,
        },
        transaction
      });
    
      if(!saveAttemptAsCorrect) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.activity.errors.service.check_attempt,
        }
      }

      // Commit transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.activity.success.check_attempt,
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
  },

}