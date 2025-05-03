const { Op } = require('sequelize');
const { Achievement, AchievementsHealthRecord, Patient, TutorTherapist, User, UserRoles, HealthRecord, Phase, sequelize } = require('@models/index');
const logger = require('@config/logger.config');
const { roleConstants: constants } = require('@constants');
const { initialAchievements } = require('@fixtures');
const { achievementsContainer, defaultAchievementImage } = require('@config/variables.config');
const {
  messages,
  dataStructure,
  formatErrorMessages,
  pagination,
  azureImages
} = require('@utils');
const { patientBelongsToTherapist } = require('@helpers');



module.exports = {

  /* eslint-disable radix */
  async getAllAchievements(query, payload) {
    try {

      // Variables
      let avoidTheseIds; // This variable will save all the ids from the achievements that are associated with phases or the patient.
      let whereCondition = {
        status: true,
      }

      // Filter by name
      if(query.name) {
        whereCondition = {
          ...whereCondition,
          name: {
            [Op.iLike]: `%${query.name}%`
          }
        }
      }

      // Filter Achievements not assigned to the patient.
      if(query.patientId) {

        const { error:verifyPatientError, message:verifyPatientMessage, statusCode: verifyPatientStatus, patientExist } = await patientBelongsToTherapist(payload, query.patientId);

        if(verifyPatientError) {
          return {
            error:verifyPatientError,
            statusCode: verifyPatientStatus,
            message: verifyPatientMessage
          }
        }


        if(patientExist.HealthRecord.AchievementsHealthRecords.length > 0) {
          avoidTheseIds = patientExist.HealthRecord.AchievementsHealthRecords.map((item) => (item.Achievement.id))
        }
      }

      if(payload.roles.includes(constants.THERAPIST_ROLE)) {

        const getAchievementIds = await Phase.findAll({
          where: {
            status: true,
          },
          attributes: ['id','achievementId'],
        });

        // getting the achievements associated to phases
        const achievementIds = getAchievementIds.map((item) => (item.achievementId));
        avoidTheseIds = avoidTheseIds ? [...avoidTheseIds, ...achievementIds] : achievementIds;

        // avoid show the phase Achievements
        whereCondition = {
          ...whereCondition,
          id: {
            [Op.notIn]: avoidTheseIds
          }
        };
      }

      // If the user logged is not a Therapist we just add the ids that the patient has already assigned and these ids will not be showed in the list
      if(avoidTheseIds && avoidTheseIds.length > 0) {
        whereCondition = {
          ...whereCondition,
          id: {
            [Op.notIn]: avoidTheseIds
          }
        }
      }

      if(!query.page || !query.size || parseInt(query.page) === 0 && parseInt(query.size) === 0) {

        const achievements = await Achievement.findAll({
          where: whereCondition,
          order: [['createdAt', 'ASC']],
        });

        return {
          error: false,
          statusCode: 200,
          message: messages.achievements.success.all,
          data: achievements.length ? dataStructure.achievementsDataStructure(achievements) : [],
        };
      }

      const {
        limit,
        offset
      } = pagination.paginationValidation(query.page, query.size);

      const data = await Achievement.findAndCountAll({
        limit,
        offset,
        distinct: true,
        order: [['createdAt', 'ASC']],
        where: whereCondition,
      });

      if(!data) {
        return {
          error: false,
          statusCode: 200,
          message: messages.achievements.success.all,
          data: [],
        }
      }

      data.rows = dataStructure.achievementsDataStructure(data.rows);

      const dataResponse = pagination.getPageData(data, query.page, limit);

      return {
        error: false,
        statusCode: 200,
        message: messages.achievements.success.all,
        ...dataResponse
      };

    } catch (error) {
      logger.error(`${messages.achievements.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

  async findAchievement(id, payload) {
    try {

      if(payload.roles.includes(constants.THERAPIST_ROLE)) {

        const phaseHasAchievement = await Phase.findOne({
          where: {
            achievementId: id,
            status: true,
          }
        });

        if(phaseHasAchievement) {
          return {
            error: true,
            statusCode: 404,
            message: messages.achievements.errors.not_found
          }
        }

      }

      const data = await Achievement.findOne({
        where: {
          id,
          status: true,
        }
      });

      if(!data) {
        return {
          error: true,
          statusCode: 404,
          message: messages.achievements.errors.not_found
        }
      }

      return {
        error: false,
        statusCode: 200,
        message: messages.achievements.success.found,
        data: dataStructure.findAchievementDataStructure(data),
      }

    } catch (error) {
      logger.error(`${messages.achievements.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

  async createAchievement(body, file) {
    const transaction = await sequelize.transaction();
    try {

      // varify if name already exist
      const achievementNameExist = await Achievement.findOne({
        where: {
          name: body.name,
          status: true
        }
      });
      if(achievementNameExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('name', messages.achievements.errors.in_use.name),
        }
      }

      // Handle image upload
      if(file) {
        const { error, statusCode, message, url } = await azureImages.uploadImage(file, achievementsContainer);

        if(error) {
          await transaction.rollback();
          return {
            error,
            statusCode,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('upload', message),
          }
        }

        body.imageUrl = url;
      } else {
        body.imageUrl = defaultAchievementImage;
      }

      // create achievement
      const data = await Achievement.create({
        name: body.name,
        imageUrl: body.imageUrl,
      },{transaction});

      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('create', messages.achievements.errors.service.create),
        }
      }

      // Commit Transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 201,
        message: messages.achievements.success.create,
        data: dataStructure.findAchievementDataStructure(data),
      }

    } catch(error) {
      await transaction.rollback();
      logger.error(`${messages.achievements.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

  async updateAchievement(id, body, file) {
    const transaction = await sequelize.transaction();
    try {

      // Verify if achievement exist
      const achievementExist = await Achievement.findOne({
        where: {
          id,
          status: true,
        }
      });
      if(!achievementExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('update', messages.achievements.errors.not_found),
        }
      }

      // Verify if name exist
      if(body.name) {
        const achievementNameExist = await Achievement.findOne({
          where: {
            name: body.name,
            status: true,
            id: {
              [Op.ne]: id,
            }
          }
        });
        if(achievementNameExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('name', messages.achievements.errors.in_use.name),
          }
        }
      }

      if(file) {
        const imageName = achievementExist.imageUrl.split('/').pop();
        let handleError;

        if(achievementExist.imageUrl === defaultAchievementImage) {
          const { url, ...restResponse } = await azureImages.updateAndUploadImage(file, null, achievementsContainer);
          handleError = restResponse;

          body.imageUrl = url;
        }

        if(achievementExist.imageUrl !== defaultAchievementImage) {
          const { url, ...restResponse } = await azureImages.updateAndUploadImage(file, imageName, achievementsContainer);
          handleError = restResponse;

          body.imageUrl = url;
        }

        if(handleError.error) {
          await transaction.rollback();
          return {
            error: handleError.error,
            statusCode: handleError.statusCode,
            message: messages.generalMessages.server,
            validationErrors: formatErrorMessages('upload', handleError.message),
          }
        }
      }

      const data = await Achievement.update({
        ...body
      },{
        where: {
          id,
          status: true,
        },
        transaction,
        returning: true,
      });

      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('update', messages.achievements.errors.service.update),
        }
      }

      // Commit Transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.achievements.success.update,
        data: dataStructure.findAchievementDataStructure(data[1][0]),
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.achievements.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },


  async deleteAchievement(id) {
    const transaction = await sequelize.transaction();
    try {

      // Verify if achievement does not belong to Phase
      const phaseHasAchievement = await Phase.findOne({
        where: {
          status: true,
          achievementId: id
        },
      });

      if(phaseHasAchievement) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.achievements.errors.service.delete_not_allowed
        }
      }

      // Verify if achievement exist
      const achievementExist = await Achievement.findOne({
        where: {
          id,
          status: true,
        }
      });
      if(!achievementExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.achievements.errors.not_found,
        }
      }


      // Verify if this achievement belong to default achivement per phase.
      const validateAChievement = initialAchievements.find((item) => item.name === achievementExist.name);
      if(validateAChievement) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.achievements.errors.service.not_allowed,
        }
      }

      const data = await Achievement.update({
        status: false
      },{
        where: {
          id,
          status: true,
        },
        transaction,
      });

      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.achievements.errors.service.delete,
        }
      }

      // Delete achievement image in the azure container
      if(achievementExist.imageUrl !== defaultAchievementImage) {
        const imageName = achievementExist.imageUrl.split('/').pop();
        const { error, statusCode, message } = await azureImages.deleteAzureImage(imageName, achievementsContainer);

        if(error) {
          await transaction.rollback();
          return {
            error,
            statusCode,
            message
          }
        }
      }

      // Commit Transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.achievements.success.delete,
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.achievements.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

  async assignAchievement({ patientId, achievementId }, payload) {
    const transaction = await sequelize.transaction();
    try {
      // Variables
      let patientWhereCondition = {
        status: true,
        id: patientId,
      };

      // Verify if achievementId belongs to some phase
      const getAchievementIds = await Phase.findAll({
        where: {
          status: true,
        },
        attributes: ['id','achievementId'],
      });

      const achievementIds = getAchievementIds.map((item) => (item.achievementId));

      if(achievementIds.includes(achievementId)) {
        return {
          error: true,
          statusCode: 409,
          message: messages.achievements.errors.service.assign_not_allowed
        }
      }


      // Find the therapist
      if(payload.roles.includes(constants.THERAPIST_ROLE)) {
        const therapistResponse = await TutorTherapist.findOne({
          where: {
            userId: payload.id
          },
          include: [
            {
              model: User,
              where: {
                status: true,
                userVerified: true,
              },
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

        if(!therapistResponse) {
          return {
            error: true,
            statusCode: 404,
            message: messages.therapist.errors.not_found
          }
        }

        // add therapist id to patient request
        patientWhereCondition = {
          ...patientWhereCondition,
          therapistId: therapistResponse.id
        }
      }

      // Verify if patient exist
      const patientExist = await Patient.findOne({
        where: patientWhereCondition,
        include: [
          {
            model: User,
            where: {
              status: true,
              userVerified: true,
            }
          },
          {
            model: HealthRecord,
            attributes: {
              exclude: ['createdAt','updatedAt','status','patientId']
            },
            include: [
              {
                model: AchievementsHealthRecord
              }
            ],
          }
        ]
      });

      if(!patientExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.patient.errors.not_found,
        }
      }

      // Verify if achievement exist
      const achievementExist = await Achievement.findOne({
        where: {
          id: achievementId,
          status: true,
        }
      });
      if(!achievementExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.achievements.errors.not_found,
        }
      }

      // verify if patient already has this achievement
      const patientAchievementExist = await AchievementsHealthRecord.findOne({
        where: {
          achievementId,
          healthRecordId: patientExist.HealthRecord.id,
          status: true,
        }
      });
      if(patientAchievementExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.achievements.errors.service.patient_already_has,
        }
      }

      // assign achievement
      const data = await AchievementsHealthRecord.create({
        achievementId,
        healthRecordId: patientExist.HealthRecord.id,
      },{
        transaction,
        returning: true,
      });

      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.achievements.errors.service.assign,
        }
      }

      // Commit transaction
      await transaction.commit();

      const newData = await Achievement.findOne({
        where: {
          id: data.id,
          status: true,
        }
      });

      return {
        error: false,
        statusCode: 201,
        message: messages.achievements.success.assign,
        data: dataStructure.findAchievementDataStructure(newData)
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.achievements.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

  async unassignAchievement({ patientId, achievementId }) {
    const transaction = await sequelize.transaction();
    try {

      // Verify if achievementId belongs to some phase
      const getAchievementIds = await Phase.findAll({
        where: {
          status: true,
        },
        attributes: ['id','achievementId'],
      });

      const achievementIds = getAchievementIds.map((item) => (item.achievementId));

      if(achievementIds.includes(achievementId)) {
        return {
          error: true,
          statusCode: 409,
          message: messages.achievements.errors.service.unAssign_not_allowed
        }
      }

      // Verify if patient exist
      const patientExist = await Patient.findOne({
        where: {
          status: true,
          id: patientId
        },
        include: [
          {
            model: User,
            where: {
              status: true,
              userVerified: true,
            }
          },
          {
            model: HealthRecord,
            attributes: {
              exclude: ['createdAt','updatedAt','status','patientId']
            },
            include: [
              {
                model: AchievementsHealthRecord
              }
            ],
          }
        ]
      });

      if(!patientExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.patient.errors.not_found,
        }
      }

      // Verify if achievement exist
      const achievementExist = await Achievement.findOne({
        where: {
          id: achievementId,
        }
      });
      if(!achievementExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.achievements.errors.not_found,
        }
      }

      // AchievementsHealthRecord Validation
      const patientAchievementExist = await AchievementsHealthRecord.findOne({
        where: {
          achievementId,
          healthRecordId: patientExist.HealthRecord.id,
          status: true
        }
      });

      // verify if patient has the achievement associated
      if(!patientAchievementExist) {
        return {
          error: true,
          statusCode: 409,
          message: messages.achievements.errors.service.assign,
        }
      }

      // unAssign achievement
      const data = await AchievementsHealthRecord.update({
        status: false
      },{
        where: {
          status: true,
          achievementId,
          healthRecordId: patientExist.HealthRecord.id,
        },
        transaction
      });

      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.achievements.errors.service.assign,
        }
      }

      // Commit Transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.achievements.success.unassign,
      }
    } catch(error) {
      await transaction.rollback();
      logger.error(`${messages.achievements.errors.service.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  }

}
