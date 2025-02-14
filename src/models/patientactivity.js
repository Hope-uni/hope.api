const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PatientActivity extends Model { }
  PatientActivity.init({
    isCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    satisfactoryAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,  
      defaultValue: true,
    }
  }, {
    sequelize,
    modelName: 'PatientActivity',
  });

  PatientActivity.associate = (models) => {
    PatientActivity.belongsTo(models.Patient, {
      foreignKey: 'patientId',
    });

    PatientActivity.belongsTo(models.Activity, {
      foreignKey: 'activityId',
    });
  }

  return PatientActivity;
};