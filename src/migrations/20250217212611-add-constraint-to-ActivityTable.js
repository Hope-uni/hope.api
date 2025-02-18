const logger = require('../config/logger.config');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('Activities', 'userId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
      }, { transaction });

      // Commit transaction
      await transaction.commit();
    } catch (error) {
      logger.error(`${error.message}`);
      await transaction.rollback();
      throw error;
    } 
  },

  async down (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('Activities', 'userId', { transaction });

      // Commit transaction
      await transaction.commit();
    } catch (error) {
      logger.error(`${error.message}`);
      await transaction.rollback();
      throw error;
    }
  }
};
