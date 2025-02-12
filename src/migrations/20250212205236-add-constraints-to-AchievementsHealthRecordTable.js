const logger = require('../config/logger.config');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      
      await queryInterface.addColumn('AchievementsHealthRecords', 'healthRecordId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'HealthRecords',
          key: 'id'
        },
      },{transaction});


      await queryInterface.addColumn('AchievementsHealthRecords', 'achievementId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Achievements',
          key: 'id'
        },
      },{transaction});


      // Commit Transaction
      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error trying to add constraints to the AchievementsHealthRecord table: ${error}`);
      throw error;
    }
  },

  async down (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      
      await queryInterface.removeColumn('AchievementsHealthRecords', 'healthRecordId', {transaction});
      await queryInterface.removeColumn('AchievementsHealthRecords', 'achievementId', {transaction});

      // Commit Transaction
      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error trying to remove constraints from the AchievementsHealthRecord table: ${error}`);
      throw error;
    }
  }
};
