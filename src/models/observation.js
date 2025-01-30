const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Observation extends Model {}
  Observation.init({
    description: {
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
    modelName: 'Observation',
  });

  Observation.associate = (models) => {

    Observation.belongsTo(models.User, {
      foreignKey: 'userId',
    });

    Observation.belongsTo(models.HealthRecord, {
      foreignKey: 'healthRecordId',
    });
  }

  return Observation;
};