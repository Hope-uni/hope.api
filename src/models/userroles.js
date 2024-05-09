const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserRoles extends Model {}
  UserRoles.init({
    userId: DataTypes.INTEGER,
    roleId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserRoles',
  });

  UserRoles.associate = (models) => {
  
    UserRoles.belongsTo(models.User, {
      foreignKey: 'userId'
    });

    UserRoles.belongsTo(models.Role, {
      foreignKey: 'roleId'
    });

  }

  return UserRoles;
};