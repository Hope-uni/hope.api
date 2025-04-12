const bcrypt = require('bcrypt');
const logger = require('../config/logger.config');
const { SeederMeta } = require('../models/index');
const { userCode } = require('../config/variables.config');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    const date = new Date();
    // Password hash
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(userCode, salt);
    try {

      const seederName = 'AdminUser';

      const executedSeeders =await SeederMeta.findOne({
        where: {
          name: seederName
        },
        transaction,
        logging: false,
      });

      if(executedSeeders) {
        await transaction.commit();
        return;
      }

      if(!executedSeeders){
        await queryInterface.bulkInsert('Users',[
          {
            username: 'hope',
            password: hashPassword,
            email: 'superadmin@hope.com',
            status: true,
            userVerified: true,
            createdAt: new Date(
              date.toDateString(
                date.getYear(),
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
          }
        ],{ transaction });

        const seederRegistered = await SeederMeta.create({
          name: seederName
        },{transaction});

        if(!seederRegistered) {
          await transaction.rollback();
          logger.error(`Seeder History was not created!`);
        }

        await transaction.commit();
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in user seed: ${error}`);
      throw error;
    }
  },

  async down (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {

      await queryInterface.bulkDelete('Users',{ username: 'hope' },{ transaction });

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in user seed: ${error}`);
      throw error;
    }
  }
};
