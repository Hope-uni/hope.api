/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('People', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      secondName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      surname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      secondSurname: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      imageProfile: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('People');
  }
};