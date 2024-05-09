
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Patients', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tutorId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'TutorTherapists',
          key: 'id'
        }
      },
      therapistId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'TutorTherapists',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: true
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
    await queryInterface.dropTable('Patients');
  }
};