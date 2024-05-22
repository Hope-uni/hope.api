const logger = require('../config/logger.config');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      
      await queryInterface.addColumn('Pictograms', 'categoryId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'Categories',
          key: 'id',
        }
      }, {transaction});

      await transaction.commit();

    } catch (error) {
      logger.error(`There was an error trying to migrate categoryId constraint to Pictogram table: ${error}`);
      await transaction.rollback();
      throw error;
    }
  },

  async down (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      
      await queryInterface.removeColumn('Pictograms','categoryId', {transaction});

      await transaction.commit();

    } catch (error) {
      logger.error(`There was an error trying to migrate categoryId constraint to Pictogram table: ${error}`);
      await transaction.rollback();
      throw error;
    }
  }
};
