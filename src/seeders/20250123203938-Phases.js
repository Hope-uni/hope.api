const logger = require('../config/logger.config');
const {  SeederMeta } = require('../models/index');
const { getFixtures } = require('../utils/fixtures.util');


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {

      const seederName = 'Phases';

      const executedSeeders = await SeederMeta.findOne({
        where: {
          name: seederName,
        }
      });

      if(!executedSeeders) {
        await queryInterface.bulkInsert('Phases', getFixtures, {transaction});


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

      await queryInterface.bulkDelete('Phases',{ name:getFixtures[0].name }, { transaction }); 
      await queryInterface.bulkDelete('Phases',{ name:getFixtures[1].name }, { transaction }); 
      await queryInterface.bulkDelete('Phases',{ name:getFixtures[2].name }, { transaction }); 
      await queryInterface.bulkDelete('Phases',{ name:getFixtures[3].name }, { transaction }); 
      await queryInterface.bulkDelete('Phases',{ name:getFixtures[4].name }, { transaction }); 
      await queryInterface.bulkDelete('Phases',{ name:getFixtures[5].name }, { transaction }); 

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in Phases seed: ${error}`);
      throw error;
    }
  }
};
