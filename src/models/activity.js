const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Activity extends Model {}
  Activity.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    satisfactoryPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pictogramSentence: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'Activity',
  });

  Activity.associate = (models) => {
    Activity.hasMany(models.PatientActivity, {
      foreignKey: 'activityId',
    });

    Activity.belongsTo(models.Phase, {
      foreignKey: 'phaseId',
    });

    Activity.belongsTo(models.User, {
      foreignKey: 'userId',
    });
  }

  return Activity;
};