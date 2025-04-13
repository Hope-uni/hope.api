const logger = require('../config/logger.config');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {

      await queryInterface.addColumn('Phases', 'achievementId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'Achievements',
          key: 'id'
        },
        allowNull: true,
      }, { transaction });

      // Commit Transaction
      await transaction.commit();

    } catch(error) {
      await transaction.rollback();
      logger.error(`There was an error trying to add achievementId to Phases table: ${error}`);
      throw error;
    }
  },

  async down (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {

      await queryInterface.removeColumn('Phases', 'achievementId', { transaction });

      // Commit Transaction
      await transaction.commit();

    } catch(error) {
      await transaction.rollback();
      logger.error(`There was an error trying to add achievementId to Phases table: ${error}`);
      throw error;
    }
  }
};
