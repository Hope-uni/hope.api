
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HealthRecordPhase extends Model {}
  HealthRecordPhase.init({
    phaseCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'HealthRecordPhase',
  });


  HealthRecordPhase.associate = (models) => {

    HealthRecordPhase.belongsTo(models.HealthRecord, {
      foreignKey: 'healthRecordId',
    });

    HealthRecordPhase.belongsTo(models.Phase, {
      foreignKey: 'phaseId',
    });

  }

  return HealthRecordPhase;
};