const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AuthToken extends Model {}
  AuthToken.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'AuthToken',
  });

  AuthToken.associate = (models) => {
    AuthToken.belongsTo(models.User, {
      foreignKey: 'userId'
    });
  };

  return AuthToken;
};