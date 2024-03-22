const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {}
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'User',
  });

  User.associate = (models) => {
    User.belongsTo(models.Role, {
      foreignKey: 'roleId',
    });

    User.hasOne(models.AuthToken, {
      foreignKey: 'userId',
      as: 'User'
    });

    User.hasOne(models.Therapist, {
      foreignKey: 'idUser',
    });

    User.hasOne(models.Tutor, {
      foreignKey: 'idUser',
    });

    User.hasOne(models.Patient, {
      foreignKey: 'idUser',
    });

  }

  return User;
};