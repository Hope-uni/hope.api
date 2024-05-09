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
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    birthday: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Person',
  });

  Person.associate = (models) => {
    Person.hasOne(models.TutorTherapist, {
      foreignKey: 'personId'
    });
    Person.hasOne(models.Patient, {
      foreignKey: 'personId'
    });
  };

  return Person;
};