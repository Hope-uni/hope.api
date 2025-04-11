const logger = require('../config/logger.config');
const { SeederMeta } = require('../models/index');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    const date = new Date();
    try {

      const seederName = 'Roles';

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

      if(!executedSeeders) {
        await queryInterface.bulkInsert('Roles', [
          {
            name: 'Superadmin',
            status: true,
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
          },
          {
            name: 'Admin',
            status: true,
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
          },
          {
            name: 'Terapeuta',
            status: true,
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
          },
          {
            name: 'Paciente',
            status: true,
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
          },
          {
            name: 'Tutor',
            status: true,
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
          },
        ], { transaction });

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
      logger.error(`There was an error in Role admin seeder: ${error}`);
      throw error;
    }
  },

  async down (queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {

      await queryInterface.bulkDelete('Roles', { name: 'Superadmin' },{transaction});
      await queryInterface.bulkDelete('Roles', { name: 'Admin' },{transaction});
      await queryInterface.bulkDelete('Roles', { name: 'Terapeuta' },{transaction});
      await queryInterface.bulkDelete('Roles', { name: 'Paciente' },{transaction});
      await queryInterface.bulkDelete('Roles', { name: 'Tutor' },{transaction});

      await transaction.commit();

    } catch (error) {
      await transaction.rollback();
      logger.error(`There was an error in Role admin seeder: ${error}`);
      throw error;
    }
  }
};
