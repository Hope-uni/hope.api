const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AchievementsHealthRecord extends Model { }
  AchievementsHealthRecord.init({
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    }
  }, {
    sequelize,
    modelName: 'AchievementsHealthRecord',
  });

  AchievementsHealthRecord.associate = (models) => {
    AchievementsHealthRecord.belongsTo(models.Achievement, {
      foreignKey: 'achievementId',
    });
    AchievementsHealthRecord.belongsTo(models.HealthRecord, {
      foreignKey: 'healthRecordId',
    });
  }

  return AchievementsHealthRecord;
};