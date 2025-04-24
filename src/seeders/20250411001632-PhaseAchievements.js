const logger = require('../config/logger.config');
const {  SeederMeta } = require('../models/index');
const { initialAchievements } = require('../fixtures');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {

      const seederName = 'PhaseAchievements';

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
        await queryInterface.bulkInsert('Achievements', initialAchievements, {transaction});

        const seederRegistered = await SeederMeta.create({
          name: seederName,
        }, { transaction });

        if(!seederRegistered) {
          await transaction.rollback();
          logger.error(`Achievement Seeder History was not created!`);
        }

        // Commit Transaction
        await transaction.commit();
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in PhaseAchievements seed: ${error}`);
      throw error;
    }
  },

  async down (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {

      await queryInterface.bulkDelete('Achievements',{ name:initialAchievements[0].name }, { transaction });
      await queryInterface.bulkDelete('Achievements',{ name:initialAchievements[1].name }, { transaction });
      await queryInterface.bulkDelete('Achievements',{ name:initialAchievements[2].name }, { transaction });
      await queryInterface.bulkDelete('Achievements',{ name:initialAchievements[3].name }, { transaction });
      await queryInterface.bulkDelete('Achievements',{ name:initialAchievements[4].name }, { transaction });
      await queryInterface.bulkDelete('Achievements',{ name:initialAchievements[5].name }, { transaction });

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in PhaseAchievements seed: ${error}`);
      throw error;
    }
  }
};
