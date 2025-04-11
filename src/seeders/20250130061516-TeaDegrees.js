const logger = require('../config/logger.config');
const {  SeederMeta } = require('../models/index');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    const date = new Date();
    try {

      const seederName = 'TeaDegrees';

      const executedSeeders = await SeederMeta.findOne({
        where: {
          name: seederName,
        },
        transaction,
        logging: false,
      });

      if(executedSeeders) {
        await transaction.commit();
        return;
      }

      if(!executedSeeders) {

        await queryInterface.bulkInsert('TeaDegrees', [
          {
            name: 'Grado 1',
            description: 'Necesita ayuda',
            createdAt: new Date (
              date.toDateString(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
                date.getSeconds()
              )
            ),
            updatedAt: new Date(
              date.toDateString(
                date.getYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
                date.getSeconds()
              )
            ),
          },
          {
            name: 'Grado 2',
            description: 'Necesita ayuda notable',
            createdAt: new Date (
              date.toDateString(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
                date.getSeconds()
              )
            ),
            updatedAt: new Date(
              date.toDateString(
                date.getYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
                date.getSeconds()
              )
            ),
          },
          {
            name: 'Grado 3',
            description: 'Necesita ayuda muy notable',
            createdAt: new Date (
              date.toDateString(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
                date.getSeconds()
              )
            ),
            updatedAt: new Date(
              date.toDateString(
                date.getYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
                date.getSeconds()
              )
            ),
          },
        ], {transaction});


        const seederRegistered = await SeederMeta.create({
          name: seederName,
        }, {transaction});

        if(!seederRegistered) {
          await transaction.rollback();
          logger.error(`Seeder History ${seederName} was not created!`);
        }

        await transaction.commit();

      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in TeaDegrees seed: ${error}`);
    }
  },

  async down (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {

      await queryInterface.bulkDelete('TeaDegrees',{ name:'Grado 1' }, { transaction });
      await queryInterface.bulkDelete('TeaDegrees',{ name:'Grado 2' }, { transaction });
      await queryInterface.bulkDelete('TeaDegrees',{ name:'Grado 3' }, { transaction });

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in TeaDegrees seed: ${error}`);
      throw error;
    }
  }
};
