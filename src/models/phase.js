const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Phase extends Model {}
  Phase.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    scoreActivities: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    }
  }, {
    sequelize,
    modelName: 'Phase',
  });

  Phase.associate = (models) => {

    Phase.hasMany(models.HealthRecordPhase, {
      foreignKey: 'phaseId',
    });

    Phase.belongsTo(models.Achievement, {
      foreignKey: 'achievementId',
    });

  }

  return Phase;
};
