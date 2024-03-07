const bcrypt = require('bcrypt');
const logger = require('../config/logger.config');
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
      await queryInterface.bulkInsert('Users',[
        {
          username: 'hope',
          password: hashPassword,
          email: 'superadmin@hope.com',
          status: true,
          roleId: 1,
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

      await transaction.commit();

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
