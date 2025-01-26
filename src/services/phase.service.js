const { Phase, sequelize } = require('@models/index');
const { Op } = require('sequelize');
const logger = require('@config/logger.config');
const { messages } = require('@utils/index');


module.exports = {

  async all() {
    try {
      
      const data = await Phase.findAll({
        where: {
          status: true,
        },
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'status']
        }
      });

      if(!data) {
        return {
          statusCode: 404,
          error: true,
          message: messages.phase.errors.service.all,
        }
      }

      return {
        statusCode: 200,
        error: false,
        message: messages.phase.success.all,
        data,
      }
    } catch (error) {
      logger.error(`${messages.phase.errors.service.base}: ${error}`);
      return {
        statusCode: 500,
        error: true,
        message: `${messages.phase.errors.service.base}: ${error}`,
      }
    }
  },


  async update(id, body) {
    const transaction = await sequelize.transaction();
    try {


      // Phase Exist
      const phaseExist = await Phase.findByPk(id);
      if(!phaseExist) {
        await transaction.rollback();
        return {
          statusCode: 404,
          error: true,
          message: `${messages.phase.errors.not_found}`,
        }
      }
      
      // name exist validation
      if(body.name) {
        const nameExist = await Phase.findOne({
          where: {
            name: body.name,
            status: true,
            id: {
              [Op.ne]: id,
            }
          },
        });

        if(nameExist) {
          await transaction.rollback();
          return {
            statusCode: 400,
            error: true,
            message: `${messages.phase.errors.in_use.name}`,
          }
        }
      };

      // Update Phase
      const udpatePhaseResponse = await Phase.update(
        {
          ...body
        },
        {
          where: {
            id,
          },
          transaction
        }
      );

      if(!udpatePhaseResponse) {
        await transaction.rollback();
        return {
          statusCode: 400,
          error: true,
          message: `${messages.phase.errors.service.update}`,
        }
      };

      // Commit transaction
      await transaction.commit();

      // Get phase data updated
      const data = await Phase.findOne({
        where: {
          id
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        }
      });


      return {
        error: false,
        message: `${messages.phase.success.update}`,
        data,
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.phase.errors.service.base}: ${error}`);
      return {
        statusCode: 500,
        error: true,
        message: `${messages.phase.errors.service.base}: ${error}`,
      }
    }
  }

}