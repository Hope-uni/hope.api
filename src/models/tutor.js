const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Tutor extends Model {}
  Tutor.init({
    identificationNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phoneNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    telephone: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Tutor',
  });

  Tutor.associate = (models) => {

    Tutor.belongsTo(models.Person, {
      foreignKey: 'idPerson',
    });

    Tutor.belongsTo(models.User, {
      foreignKey: 'idUser',
    });

    Tutor.hasMany(models.Patient,{
      foreignKey: 'idTutor'
    });

  }

  return Tutor;
};