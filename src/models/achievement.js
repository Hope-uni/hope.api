const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Achievement extends Model {}
  Achievement.init({
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
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
    modelName: 'Achievement',
  });

  Achievement.associate = (models) => {

    Achievement.hasMany(models.AchievementsHealthRecord, {
      foreignKey: 'achievementId',
    });

  }

  return Achievement;
};