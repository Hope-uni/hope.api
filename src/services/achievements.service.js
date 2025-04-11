const { Op } = require('sequelize');
const { Achievement, AchievementsHealthRecord, Patient, TutorTherapist, User, UserRoles, HealthRecord, sequelize } = require('@models/index');
const logger = require('@config/logger.config');
const { 
  messages, 
  dataStructure, 
  formatErrorMessages,
  pagination,
  fixtures 
} = require('../utils');
const { roleConstants: constants } = require('../constants');



module.exports = {

  /* eslint-disable radix */
  async getAllAchievements(query) {
    try {

      if(!query.page || !query.size || parseInt(query.page) === 0 && parseInt(query.size) === 0) {

        const achievements = await Achievement.findAll({
          where: {
            status: true,
          },
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
        where: {
          status: true,
        }
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
  
  async findAchievement(id) {
    try {
      
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

  async createAchievement(body) {
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

  async updateAchievement(id, body) {
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

      // Verify if achievement exist
      const achievementExist = await Achievement.findOne({
        where: {
          [Op.and]: [
            {
              id,
            },
            {
              id: {
                [Op.notIn]: [1,2,3,4,5,6]
              }
            }
          ],
          status: true,
        }
      });
      if(!achievementExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('delete', messages.achievements.errors.not_found),
        }
      }


      // Verify if this achievement belong to default achivement per phase.
      const validateAChievement = fixtures.initialAchievements.find((item) => item.name === achievementExist.name);
      if(validateAChievement) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.achievements.errors.service.not_alowed,
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
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('delete', messages.achievements.errors.service.delete),
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
          [Op.and]: [
            {
              id: achievementId,
            },
            {
              id: {
                [Op.notIn]: [1,2,3,4,5,6]
              }
            }
          ],
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

      // Commit transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 201,
        message: messages.achievements.success.assign,
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
  }

}