const logger = require('../config/logger.config');


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {

      // remove the imageProfile from Person table.
      await queryInterface.removeColumn('People', 'imageProfile', {transaction});

      // add the imageProfile but with imageUrl name in user.
      await queryInterface.addColumn('Users', 'imageUrl',{
        type: Sequelize.STRING,
        allowNull: true,
      }, {transaction});

      // Commit Transaction
      await transaction.commit();

    } catch(error) {
      await transaction.rollback();
      logger.error(`There was an error trying to move imageProfile in person table to user table with different name: ${error}`);
      throw new Error;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {

      await queryInterface.removeColumn('Users', 'imageUrl', { transaction });

      await queryInterface.addColumn('People', 'imageProfile', {
        type: Sequelize.STRING,
        allowNull: true,
      }, {transaction});

      // Commit Transaction
      await transaction.commit();

    } catch(error) {
      await transaction.rollback();
      logger.error(`There was an error trying to move imageProfile in person table to user table with different name: ${error}`);
      throw new Error;
    }
  }
};
