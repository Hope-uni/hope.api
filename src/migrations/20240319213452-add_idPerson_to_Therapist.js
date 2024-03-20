

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.addColumn('Therapists','idPerson',{
      type: Sequelize.INTEGER,
      references: {
        model: 'People',
        key: 'id',
      }
    });

  },

  async down (queryInterface) {
    
    await queryInterface.removeColumn('Therapists','idPerson');

  }
};
