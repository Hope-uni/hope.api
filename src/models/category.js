const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {  }
  Category.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    }
  }, {
    sequelize,
    modelName: 'Category',
  });

  Category.associate = (models )=> {
    Category.hasMany(models.Pictogram,{
      foreignKey: 'categoryId',
    });
  }

  return Category;
};