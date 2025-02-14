const logger = require('../config/logger.config');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      
      await queryInterface.addColumn('Activities','phaseId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Phases',
          key: 'id'
        },
      }, {transaction});

      await queryInterface.addColumn('PatientActivities','activityId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Activities',
          key: 'id'
        },
      }, {transaction});

      await queryInterface.addColumn('PatientActivities','patientId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Patients',
          key: 'id'
        },
      }, {transaction});

      // Commit Transaction
      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error trying to add constraints to the Activity and PatientActivity tables: ${error}`);
      throw error;
    }
  },

  async down (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      
      await queryInterface.removeColumn('Activities','phaseId', {transaction});
      await queryInterface.removeColumn('PatientActivities','activityId', {transaction});
      await queryInterface.removeColumn('PatientActivities','patientId', {transaction});

      // Commit Transaction
      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error trying to remove constraints from the Activity and PatientActivity tables: ${error}`);
      throw error;
    }
  }
};
