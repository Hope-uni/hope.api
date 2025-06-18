const logger = require('../config/logger.config');
const { SeederMeta } = require('../models/index');
const { initialCategories } = require("../fixtures");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {

      const seederName = 'Categories';

      const executedSeeders = await SeederMeta.findOne({
        where: {
          name: seederName,
        },
        transaction,
        logging: false
      });

      if(executedSeeders) {
        await transaction.commit();
        return;
      }

      if(!executedSeeders) {

        await queryInterface.bulkInsert("Categories", initialCategories, { transaction });

        const seederRegistered = await SeederMeta.create({
          name: seederName,
        }, {transaction});

        if(!seederRegistered) {
          await transaction.rollback();
          logger.error(`Seeder History was not created!`);
        }

        await transaction.commit();
      }

    } catch(error) {
      await transaction.rollback();
      logger.error(`There was an error in Categories seeder: ${error}`);
      throw error;
    }
  },

  async down (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {

      await queryInterface.bulkDelete('Categories',{ name:initialCategories[0].name }, { transaction });
      await queryInterface.bulkDelete('Categories',{ name:initialCategories[1].name }, { transaction });
      await queryInterface.bulkDelete('Categories',{ name:initialCategories[2].name }, { transaction });
      await queryInterface.bulkDelete('Categories',{ name:initialCategories[3].name }, { transaction });
      await queryInterface.bulkDelete('Categories',{ name:initialCategories[4].name }, { transaction });
      await queryInterface.bulkDelete('Categories',{ name:initialCategories[5].name }, { transaction });
      await queryInterface.bulkDelete('Categories',{ name:initialCategories[6].name }, { transaction });
      await queryInterface.bulkDelete('Categories',{ name:initialCategories[7].name }, { transaction });
      await queryInterface.bulkDelete('Categories',{ name:initialCategories[8].name }, { transaction });
      await queryInterface.bulkDelete('Categories',{ name:initialCategories[9].name }, { transaction });
      await queryInterface.bulkDelete('Categories',{ name:initialCategories[10].name }, { transaction });

      await transaction.commit();
    } catch(error) {
      await transaction.rollback();
      logger.error(`There was an error in Categories seeder: ${error}`);
      throw error;
    }
  }
};
