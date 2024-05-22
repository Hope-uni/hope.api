const logger = require('../config/logger.config');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      
      await queryInterface.addColumn('PatientPictograms', 'patientId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'Patients',
          key: 'id',
        }
      }, {transaction});
      await queryInterface.addColumn('PatientPictograms', 'pictogramId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'Pictograms',
          key: 'id',
        }
      }, {transaction});

      await transaction.commit();

    } catch (error) {
      logger.error(`There was an error trying to migrate patientId and pictogramId constraint to PatientPictogram table: ${error}`);
      await transaction.rollback();
      throw error;
    }
  },

  async down (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      
      await queryInterface.removeColumn('PatientPictograms','patientId', {transaction});
      await queryInterface.removeColumn('PatientPictograms','pictogramId', {transaction});

      await transaction.commit();

    } catch (error) {
      logger.error(`There was an error trying to migrate patientId and pictogramId constraint to PatientPictogram table: ${error}`);
      await transaction.rollback();
      throw error;
    }
  }
};
