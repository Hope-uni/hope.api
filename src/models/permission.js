const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {}
  Permission.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    group: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'Permission',
  });

  Permission.associate = (models) => {
    Permission.belongsToMany(models.Role, { through: 'RolesPermisions', as: 'roles', foreignKey: 'permissionId' });
  };

  return Permission;
};