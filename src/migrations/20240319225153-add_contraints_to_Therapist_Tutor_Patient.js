const logger = require('../config/logger.config');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      
      // Therapist
      await queryInterface.addColumn('Therapists','idUser',{
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        }
      }, {transaction});

      // Tutor
      await queryInterface.addColumn('Tutors','idPerson',{
        type: Sequelize.INTEGER,
        references: {
          model: 'People',
          key: 'id',
        }
      }, {transaction});
      
      await queryInterface.addColumn('Tutors','idUser',{
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        }
      }, {transaction});

      // Patient
      await queryInterface.addColumn('Patients','idPerson',{
        type: Sequelize.INTEGER,
        references: {
          model: 'People',
          key: 'id',
        }
      }, {transaction});

      await queryInterface.addColumn('Patients','idUser',{
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        }
      }, {transaction});

      await queryInterface.addColumn('Patients','idTutor',{
        type: Sequelize.INTEGER,
        references: {
          model: 'Tutors',
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
      
      await queryInterface.removeColumn('Therapists','idUser',{transaction});
      await queryInterface.removeColumn('Tutors','idPerson',{transaction});
      await queryInterface.removeColumn('Tutors','idUser',{transaction});
      await queryInterface.removeColumn('Patients','idPerson',{transaction});
      await queryInterface.removeColumn('Patients','idUser',{transaction});
      await queryInterface.removeColumn('Patients','idTutor',{transaction});

      await transaction.commit();

    } catch (error) {
      logger.error(`There was an error in migration constraints: ${error}`);
      await transaction.rollback();
      throw error;
    }
  }
};
