const logger = require('../config/logger.config');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    const date = new Date();
    try {
      
      await queryInterface.bulkInsert('Roles', [
        {
          name: 'Superadmin',
          status: true,
          createdAt: new Date(
            date.getYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds()
          ),
          updatedAt: new Date(
            date.getYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds()
          ),
        }
      ], { transaction }); 

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in Role admin seeder: ${error}`);
      throw error;
    }
  },

  async down (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      
      await queryInterface.bulkDelete('Roles', { name: 'Superadmin' },{transaction});

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in Role admin seeder: ${error}`);
      throw error;
    }
  }
};
