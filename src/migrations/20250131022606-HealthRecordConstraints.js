const logger = require('../config/logger.config');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      
      await queryInterface.addColumn('HealthRecords', 'patientId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'Patients',
          key: 'id',
        }
      }, {transaction});

      await queryInterface.addColumn('HealthRecords', 'phaseId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'Phases',
          key: 'id',
        }
      }, {transaction});

      await queryInterface.addColumn('HealthRecords', 'teaDegreeId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'TeaDegrees',
          key: 'id',
        }
      }, {transaction});

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error trying to migrate HealthRecord constraints: ${error}`);
      throw error;
    }
  },

  async down (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      
      await queryInterface.removeColumn('HealthRecords','patientId', {transaction});
      await queryInterface.removeColumn('HealthRecords','phaseId', {transaction});
      await queryInterface.removeColumn('HealthRecords','teaDegreeId', {transaction});

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error trying to migrate HealthRecord constraints: ${error}`);
      throw error;
    }
  }
};
