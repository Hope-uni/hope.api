const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Person extends Model {}
  Person.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    secondName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    secondSurname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    imageProfile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Person',
  });

  Person.associate = (models) => {
    Person.hasOne(models.Therapist, {
      foreignKey: 'idPerson'
    });
    Person.hasOne(models.Tutor, {
      foreignKey: 'idPerson'
    });
    Person.hasOne(models.Patient, {
      foreignKey: 'idPerson'
    });
  };

  return Person;
};