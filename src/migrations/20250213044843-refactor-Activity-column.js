const logger = require('../config/logger.config');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      
      await queryInterface.changeColumn('Activities','pictogramSentence', {
        type: Sequelize.STRING,
        allowNull: false,
      }, {transaction});

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error trying to refactor the Activity table: ${error}`);
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      
      await queryInterface.changeColumn('Activities','pictogramSentence', {
        type: Sequelize.INTEGER,
        allowNull: false,
      }, {transaction});

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error trying to refactor the Activity table: ${error}`);
      throw error;
    }
  }
};
