const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Patient extends Model {}
  Patient.init({
    age: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Patient',
  });

  Patient.associate = (models) => {
    
    Patient.belongsTo(models.Person, {
      foreignKey: 'idPerson'
    });

    Patient.belongsTo(models.User, {
      foreignKey: 'idUser'
    });

    Patient.belongsTo(models.Tutor, {
      foreignKey: 'idTutor'
    });

  }

  return Patient;
};