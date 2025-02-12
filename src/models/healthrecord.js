const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HealthRecord extends Model {}
  HealthRecord.init({
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'HealthRecord',
  });

  HealthRecord.associate = (models) => {

    HealthRecord.belongsTo(models.TeaDegree, {
      foreignKey: 'teaDegreeId',
    });

    HealthRecord.hasMany(models.HealthRecordPhase, {
      foreignKey: 'healthRecordId',
    });

    HealthRecord.hasMany(models.Observation, {
      foreignKey: 'healthRecordId',
    });

    HealthRecord.belongsTo(models.Patient, {
      foreignKey: 'patientId',
    });

    HealthRecord.belongsTo(models.Phase, {
      foreignKey: 'phaseId',
    });

    HealthRecord.hasMany(models.AchievementsHealthRecord, {
      foreignKey: 'healthRecordId',
    });

  }

  return HealthRecord;
};