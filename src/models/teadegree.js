
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TeaDegree extends Model {}
  TeaDegree.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'TeaDegree',
  });

  TeaDegree.associate = (models) => {

    TeaDegree.hasMany(models.HealthRecord, {
      foreignKey: 'teaDegreeId',
    });

  }

  return TeaDegree;
};