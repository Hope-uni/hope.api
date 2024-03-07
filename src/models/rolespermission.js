const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RolesPermission extends Model {}
  RolesPermission.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Roles',
        key: 'id',
      },
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Permissions',
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'RolesPermission',
  });
  return RolesPermission;
};