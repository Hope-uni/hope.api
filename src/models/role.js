const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {}
  Role.init({
    id:{
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'Role',
  });

  Role.associate = (models) => {
    Role.belongsToMany(models.Permission, {
      through: 'RolesPermissions',
      as: 'permissions',
      foreignKey: 'roleId',
    });
  };
  
  return Role;
};