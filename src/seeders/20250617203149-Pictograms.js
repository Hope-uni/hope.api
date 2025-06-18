const logger = require('../config/logger.config');
const { SeederMeta, Category } = require('../models/index');
const { categoryNames, initialPictograms } = require('../fixtures');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Variables
      const seederName = 'pictograms';
      const date = new Date();

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
        // get the default categories
        const categoriesData = await Category.findAll({
          where: {
            status: true,
          }
        });

        categoriesData.forEach(async (category) => {

          // check if category key has a match
          const getCategory = Object.keys(categoryNames).find(key => categoryNames[key] === category.name);

          if(getCategory) {
            const pictogramsToSave = initialPictograms[getCategory].map((pictogram) => {
              return {
                name: pictogram.name,
                imageUrl: pictogram.url,
                status: true,
                categoryId: category.id,
                createdAt: new Date(
                  date.getYear(),
                  date.getMonth(),
                  date.getDate(),
                  date.getHours(),
                  date.getMinutes(),
                  date.getSeconds()
                ),
                updatedAt: new Date(
                  date.getYear(),
                  date.getMonth(),
                  date.getDate(),
                  date.getHours(),
                  date.getMinutes(),
                  date.getSeconds()
                ),
              }
            });

            if(pictogramsToSave.length > 0) {
              await queryInterface.bulkInsert("Pictograms", pictogramsToSave, { transaction });
            }
          }
        });

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
      logger.error(`There was an error in Pictogram seeder: ${error}`);
      throw error;
    }
  },

  async down (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {

      await queryInterface.bulkDelete('Pictograms', {}, {transaction});

      await transaction.commit();
    } catch(error) {
      await transaction.rollback();
      logger.error(`There was an error in Pictogram seeder: ${error}`);
      throw error;
    }
  }
};
