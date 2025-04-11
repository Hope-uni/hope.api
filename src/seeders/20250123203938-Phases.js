const logger = require('../config/logger.config');
const {  SeederMeta } = require('../models/index');
const { initialPhases } = require('../utils/fixtures.util');


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {

      const seederName = 'Phases';

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
        await queryInterface.bulkInsert('Phases', initialPhases[0], {transaction});
        await queryInterface.bulkInsert('Phases', initialPhases[1], {transaction});
        await queryInterface.bulkInsert('Phases', initialPhases[2], {transaction});
        await queryInterface.bulkInsert('Phases', initialPhases[3], {transaction});
        await queryInterface.bulkInsert('Phases', initialPhases[4], {transaction});
        await queryInterface.bulkInsert('Phases', initialPhases[5], {transaction});


        const seederRegistered = await SeederMeta.create({
          name: seederName,
        }, {transaction});

        if(!seederRegistered) {
          await transaction.rollback();
          logger.error(`Seeder History was not created!`);
        }

        await transaction.commit();
      }
    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in Phases seed: ${error}`);
      throw error;
    }

  },

  async down (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {

      await queryInterface.bulkDelete('Phases',{ name:initialPhases[0].name }, { transaction });
      await queryInterface.bulkDelete('Phases',{ name:initialPhases[1].name }, { transaction });
      await queryInterface.bulkDelete('Phases',{ name:initialPhases[2].name }, { transaction });
      await queryInterface.bulkDelete('Phases',{ name:initialPhases[3].name }, { transaction });
      await queryInterface.bulkDelete('Phases',{ name:initialPhases[4].name }, { transaction });
      await queryInterface.bulkDelete('Phases',{ name:initialPhases[5].name }, { transaction });

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in Phases seed: ${error}`);
      throw error;
    }
  }
};
