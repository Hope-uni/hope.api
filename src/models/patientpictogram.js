const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PatientPictogram extends Model { }
  PatientPictogram.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    }
  }, {
    sequelize,
    modelName: 'PatientPictogram',
  });

  PatientPictogram.associate = (models) => {

    PatientPictogram.belongsTo(models.Patient,{
      foreignKey: 'patientId'
    });

    PatientPictogram.belongsTo(models.Pictogram,{
      foreignKey: 'pictogramId'
    });

  }

  return PatientPictogram;
};