const logger = require('../config/logger.config');
const { Role, User } = require('../models/index');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface,) {
    const transaction = await queryInterface.sequelize.transaction();
    const date = new Date();
    try {

      const roleInfo = await Role.findOne({
        where: {
          id:1 
        },
      });

      const userInfo = await User.findOne({
        where: {
          username: 'hope',
        },
      })

      await queryInterface.bulkInsert('UserRoles',[
        {
          userId: userInfo.id,
          roleId: roleInfo.id,
          createdAt: new Date(
            date.toDateString(
              date.getYear(),
              date.getMonth(),
              date.getDate(),
              date.getHours(),
              date.getMinutes(),
              date.getSeconds()
            )
          ),
          updatedAt: new Date(
            date.toDateString(
              date.getYear(),
              date.getMonth(),
              date.getDate(),
              date.getHours(),
              date.getMinutes(),
              date.getSeconds()
            )
          ),
        }
      ], {transaction});

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in userRoles seed: ${error}`);
      throw error;
    }

  },

  async down (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      
      await queryInterface.bulkDelete('UserRoles',{ roleId: 1 },{ transaction });

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in userRoles seed: ${error}`);
      throw error;
    }
  }
};
