const logger = require('../config/logger.config');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {

      await queryInterface.addColumn('Phases', 'level', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      }, { transaction });

      // Commit transaction
      await transaction.commit();

    } catch(error) {
      await transaction.rollback();
      logger.error(`There was an error trying to add level field to Phase table: ${error}`);
      throw error;
    }
  },

  async down (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {

      await queryInterface.removeColumn('Phases', 'level', { transaction });

      // Commit transaction
      await transaction.commit();

    } catch(error) {
      await transaction.rollback();
      logger.error(`There was an error trying to add level field to Phase table: ${error}`);
      throw error;
    }
  }
};
