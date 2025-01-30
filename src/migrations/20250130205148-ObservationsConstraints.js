const logger = require('../config/logger.config');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      
      await queryInterface.addColumn('Observations', 'userId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        }
      }, {transaction});
      
      await queryInterface.addColumn('Observations', 'healthRecordId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'HealthRecords',
          key: 'id',
        }
      }, {transaction});

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error trying to add constraints to Observations table: ${error}`);
      throw error;
    }
  },

  async down (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      
      await queryInterface.removeColumn('Observations','userId', {transaction});
      await queryInterface.removeColumn('Observations', 'healthRecordId', {transaction});

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error trying to remove constraints to Observations table: ${error}`);
      throw error;
    }
  }
};
