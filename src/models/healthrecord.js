
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
      foreignKey: 'teadegreeId',
    });

    HealthRecord.hasMany(models.HealthRecordPhase, {
      foreignKey: 'healthRecordId',
    })

  }

  return HealthRecord;
};