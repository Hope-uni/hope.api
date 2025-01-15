const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SeederMeta extends Model {}
  SeederMeta.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'SeederMeta',
  });
  return SeederMeta;
};