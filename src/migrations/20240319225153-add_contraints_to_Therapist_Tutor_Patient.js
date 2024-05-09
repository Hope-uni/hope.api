const logger = require('../config/logger.config');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      
      // Therapist
      await queryInterface.addColumn('TutorTherapists','userId',{
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        }
      }, {transaction});

      // Tutor
      await queryInterface.addColumn('TutorTherapists','personId',{
        type: Sequelize.INTEGER,
        references: {
          model: 'People',
          key: 'id',
        }
      }, {transaction});

      // Patient
      await queryInterface.addColumn('Patients','personId',{
        type: Sequelize.INTEGER,
        references: {
          model: 'People',
          key: 'id',
        }
      }, {transaction});

      await queryInterface.addColumn('Patients','userId',{
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        }
      }, {transaction});

      await transaction.commit();

    } catch (error) {
      logger.error(`There was an error in migration constraints: ${error}`);
      await transaction.rollback();
      throw error;
    }
  },

  async down (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      
      await queryInterface.removeColumn('TutorTherapists','personId',{transaction});
      await queryInterface.removeColumn('TutorTherapists','userId',{transaction});
      await queryInterface.removeColumn('Patients','personId',{transaction});
      await queryInterface.removeColumn('Patients','userId',{transaction});

      await transaction.commit();

    } catch (error) {
      logger.error(`There was an error in migration constraints: ${error}`);
      await transaction.rollback();
      throw error;
    }
  }
};
