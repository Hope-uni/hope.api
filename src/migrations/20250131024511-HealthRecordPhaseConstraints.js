const logger = require('../config/logger.config');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {

      await queryInterface.addColumn('HealthRecordPhases', 'healthRecordId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'HealthRecords',
          key: 'id',
        }
      }, {transaction});

      await queryInterface.addColumn('HealthRecordPhases', 'phaseId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'Phases',
          key: 'id',
        }
      }, {transaction});

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error trying to migrate HealthRecordPhase constraints: ${error}`);
      throw error;
    }
  },

  async down (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      
      await queryInterface.removeColumn('HealthRecordPhases','healthRecordId', {transaction});
      await queryInterface.removeColumn('HealthRecordPhases','phaseId', {transaction});

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error trying to migrate HealthRecordPhase constraints: ${error}`);
      throw error;
    }
  }
};
