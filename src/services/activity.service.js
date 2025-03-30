const { Op } = require('sequelize');
const logger = require('@config/logger.config');
const {
  Activity,
  Phase,
  PatientActivity,
  Patient,
  TutorTherapist,
  HealthRecord,
  User,
  Person,
  sequelize
} = require('@models/index');
const {
  formatErrorMessages,
  messages,
  dataStructure,
  pagination
} = require('@utils');
const {
  validatePictogram,
  getPictograms
} = require('@helpers');
const { roleConstants: constants } = require('@constants');
const { getFullName } = require('@utils/dataStructure');


module.exports = {

  /* eslint-disable radix */
  async all(query) {
    try {

      if(!query.page || !query.size || parseInt(query.page) === 0 && parseInt(query.size) === 0) {
        const data = await Activity.findAll({
          where: {
            status: true,
          },
          order: [['createdAt', 'ASC']],
          attributes: {
            exclude: ['createdAt','updatedAt','status','phaseId', 'pictogramSentence']
          },
          include: [
            {
              model: Phase,
              attributes: ['id', 'name', 'description'],
            },
            {
              model: User
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
          message: messages.activity.success.all,
          data: data.length > 0
          ? dataStructure.activityDataStructure(data)
          : [],
        };
      }

      const {
        limit,
        offset
      } = pagination.paginationValidation(query.page, query.size);

      const data = await Activity.findAndCountAll({
        limit,
        offset,
        distinct: true,
        order: [['createdAt', 'ASC']],
        where: {
          status: true,
        },
        attributes: {
          exclude: ['updatedAt','status','phaseId', 'pictogramSentence']
        },
        include: [
          {
            model: Phase,
            attributes: ['id', 'name', 'description'],
          },
          {
            model: User
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
          error: false,
          statusCode: 200,
          message: messages.activity.success.all,
          ...data
        }
      }

      // get Activity structure
      data.rows = dataStructure.activityDataStructure(data.rows);

      const dataResponse = pagination.getPageData(data, query.page, limit);

      return {
        error: false,
        statusCode: 200,
        message: messages.activity.success.all,
        ...dataResponse
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
            model: User
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

  async create({ name, description, satisfactoryPoints, pictogramSentence, phaseId }, payload) {
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
        phaseId,
        userId: payload.id,
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

      // getting the whole data
      const newData = await Activity.findOne({
        where: {
          id: data.id,
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
            model: User
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

      const { error:pictogramError, message:pictogramMessage, pictograms } = await getPictograms(newData.pictogramSentence);

      if(pictogramError) {
        return {
          error: true,
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('pictograms', pictogramMessage),
        }
      }

      newData.setDataValue('pictograms', pictograms);

      return {
        error: false,
        statusCode: 201,
        message: messages.activity.success.create,
        data: dataStructure.activityDataStructure(newData, true)
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

  async assingActivityPatient({ activityId, patients }, payload) {
    const transaction = await sequelize.transaction();
    try {
      // Variables
      let patientWhereCondition = {
        status: true,
      }

      // Validate if therapist has the patient in charged.
      if(payload.roles.includes(constants.THERAPIST_ROLE)) {
        const therapistExist = await TutorTherapist.findOne({
          where: {
            userId: payload.id
          }
        });

        if(!therapistExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 404,
            message: messages.therapist.errors.not_found
          }
        }

        patientWhereCondition = {
          ...patientWhereCondition,
          therapistId: therapistExist.id,
        }
      }

      // Activity exist validation
      const activityExist = await Activity.findOne({
        where: {
          id: activityId,
          status: true
        },
        include: [
          {
            model: Phase
          }
        ]
      });
      if(!activityExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.activity.errors.not_found,
        }
      }

      /* eslint-disable */
      for (const element of patients) {

        // assign the id to the patientWhereCondition
        patientWhereCondition = {
          ...patientWhereCondition,
          id: element
        }

        // Validate if patient exist
        const patientItem = await Patient.findOne({
          where: patientWhereCondition,
          include: [
            {
              model: Person,
              attributes: {
                exclude: ['createdAt','updatedAt','status']
              },
            },
            {
              model: User,
              where: {
                status: true,
              }
            },
            {
              model: HealthRecord,
              attributes: {
                exclude: ['createdAt', 'updatedAt', 'status', 'patientId']
              },
              include: [
                {
                  model: Phase,
                  attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                  }
                }
              ],
            }
          ]
        });

        if(!patientItem) {
          await transaction.rollback();
          return {
            error:true,
            statusCode:409,
            message: `${messages.patient.errors.not_found} con el id: ${element}`
          }
        }

        // Validate if patient has an therapist assigned
        if(payload.roles.some(name => name === constants.SUPERADMIN_ROLE || name === constants.ADMIN_ROLE)) {
          if(!patientItem.therapistId) {
            await transaction.rollback();
            return {
              error: true,
              statusCode: 409,
              message: messages.activity.errors.service.patient_without_therapist(getFullName(patientItem.Person)), // this message is a function that return the message with patient name
              // and the getFullName has only one purpose like the function name says build the patient's fullname
            }
          }
        }

        // Validate if the activity has the same phase that the patient
        if(activityExist.Phase.id !== patientItem.HealthRecord.Phase.id) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 409,
            message: messages.activity.errors.service.activity_phase(getFullName(patientItem.Person)) // as ai mentioned before is the same purpose specify the patient name.
          }
        }

        // PatientActivity Exist
        const activityPatientExist = await PatientActivity.findOne({
          where: {
            activityId,
            patientId: patientItem.id,
            status: true,
          }
        });
        if(activityPatientExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 409,
            message: `${messages.activity.errors.in_use.activityPatient}: ${getFullName(patientItem.Person)}`,
          }
        }

        // Validate if activity is completed
        const activityCompleted = await PatientActivity.findOne({
          where: {
            activityId,
            patientId: patientItem.id,
            isCompleted: true,
            status: true,
          }
        });
        if(activityCompleted) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 409,
            message: `${messages.activity.errors.service.already_completed} para el paciente: ${getFullName(patientItem.Person)}`,
          }
        }

        // Validate if patient has another activity assigned.
        const patientActivityAssigned = await PatientActivity.findOne({
          where: {
            patientId: patientItem.id,
            isCompleted: false,
            status: true,
          }
        });

        if(patientActivityAssigned) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 409,
            message: messages.activity.errors.in_use.patient_activity_assigned(getFullName(patientItem.Person)),
          }
        }

        // Validate if activited is unassigned to this patient
        const verifyPatientActivityisUnassigned = await PatientActivity.findOne({
          where: {
            activityId,
            patientId: patientItem.id,
            status: false,
          }
        });
        if(verifyPatientActivityisUnassigned) {
          const reassignActivity = await PatientActivity.update({
            status: true,
            satisfactoryAttempts: 0,
            isCompleted: false,
          },{
            where: {
              activityId,
              patientId: patientItem.id,
              status: false,
            },
            transaction
          });

          if(!reassignActivity) {
            await transaction.rollback();
            return {
              error: true,
              statusCode: 409,
              message: `${messages.activity.errors.service.create} para el paciente: ${getFullName(patientItem.Person)}`,
            }
          }
        } else {
          const data = await PatientActivity.create(
            {
              activityId,
              patientId: patientItem.id,
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

  async deleteActivity(id, payload) {
    const transaction = await sequelize.transaction();
    try {

      // Variable
      let whereCondition = {
        id,
        userId: payload.id,
        status: true
      }

      if(payload.roles.some(name => name === constants.SUPERADMIN_ROLE || name === constants.ADMIN_ROLE)) {
        whereCondition = {
          id,
          status:true
        }
      }

      // Activity exist validation
      const activityExist = await Activity.findOne({
        where: whereCondition
      });
      if(!activityExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.activity.errors.not_found,
        }
      }

      // Validate if activity is assigned to any patient in the system
      const activityIsAssigned = await PatientActivity.findOne({
        where: {
          activityId: id,
          status: true,
          isCompleted: false
        }
      });

      if(activityIsAssigned) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.activity.errors.service.delete_assigned_activity
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

  async unAssignActivityPatient({ patientId }, payload) {
    const transaction = await sequelize.transaction();
    try {

      // Variables
      let whereCondition = {
        id: patientId,
        status: true,
      }

      // validate if therapist has the patient in charged
      if(payload.roles.includes(constants.THERAPIST_ROLE)) {
        const therapistExist = await TutorTherapist.findOne({
          where: {
            userId: payload.id,
          }
        });
        if(!therapistExist) {
          return {
            error: true,
            statusCode: 404,
            message: messages.therapist.errors.not_found
          }
        }
        // add therapist id
        whereCondition = {
          ...whereCondition,
          therapistId: therapistExist.id
        }
      }

      // Patient exist validation
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
            model: PatientActivity,
            where: {
              status:true,
              isCompleted: false,
            }
          }
        ]
      });
      if(!patientExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.activity.errors.service.patient_activity_not_assigned,
        }
      }

      // Update Patient Activity changing status to false
      const changePatientActivityStatus = await PatientActivity.update({
        status: false
      },{
        where: {
          patientId: patientExist.id,
          status: true,
          isCompleted: false
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


  async checkActivityAnswer({ attempt, activityId }, payload) {
    const transaction = await sequelize.transaction();
    try {

      // Activity exist validation
      const activityExist = await Activity.findOne({
        where: {
          id: activityId,
          status: true
        }
      });
      if (!activityExist) {
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
          userId: payload.id,
          status: true,
        },
        include: [
          {
            model: User,
            where: {
              status: true,
            }
          }
        ]
      });
      if (!patientExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.patient.errors.not_found,
        }
      }

      // validate if pictogramSentence has a valid pictograms
      const { error, message, statusCode, validationErrors } = await validatePictogram(attempt);
      if (error) {
        await transaction.rollback();
        return {
          error,
          statusCode,
          message:messages.activity.errors.service.incorrect_answer,
        }
      }

      // Valdiate if the activity is associated with the patient previously retrieved
      const patientActivityExist = await PatientActivity.findOne({
        where: {
          activityId,
          patientId: patientExist.id,
          status: true
        }
      });
      if (!patientActivityExist) {
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
          patientId: patientExist.id,
          isCompleted: true,
          status: true,
        }
      });

      // get the pictogramSentence and check if this one match with the attempt
      const pictogramSentenceArray = activityExist.pictogramSentence.split('-').map(Number);

      // Check if the attempt is valid
      let isValidAttempt = true;
      for (let item = 0; item < pictogramSentenceArray.length; item++) {
        if(pictogramSentenceArray[item] !== attempt[item]) {
          isValidAttempt = false;
        }
      }

      if(isValidAttempt === false || pictogramSentenceArray.length !== attempt.length) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.activity.errors.service.incorrect_answer,
        }
      }

      // Save the attempt as correct
      let newSatisfactoryAttemptAmount = patientActivityExist.satisfactoryAttempts;
      if(!activityCompleted) {
        newSatisfactoryAttemptAmount = patientActivityExist.satisfactoryAttempts + 1;
      }

      // validate if satisfactoryAttempts is equal to satisfactoryPoints
      if(activityExist.satisfactoryPoints === newSatisfactoryAttemptAmount && !activityCompleted) {
        const saveAttemptAsCorrect = await PatientActivity.update({
          satisfactoryAttempts: newSatisfactoryAttemptAmount,
          isCompleted: true,
        },{
          where: {
            activityId,
            patientId: patientExist.id,
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

      if(!activityCompleted) {
        const saveAttemptAsCorrect = await PatientActivity.update({
          satisfactoryAttempts: newSatisfactoryAttemptAmount,
          },{
            where: {
              activityId,
              patientId: patientExist.id,
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
