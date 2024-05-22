const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Pictogram extends Model {}
  Pictogram.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
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
    modelName: 'Pictogram',
  });

  Pictogram.associate = (models) => {

    Pictogram.belongsTo(models.Category,{
      foreignKey: 'categoryId',
    });

    Pictogram.hasMany(models.PatientPictogram, {
      foreignKey: 'pictogramId'
    })

  }

  return Pictogram;
};