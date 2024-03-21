const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Therapist extends Model {}
  Therapist.init({
    identificationNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phoneNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Therapist',
  });


  Therapist.associate = (models) => {

    Therapist.belongsTo(models.Person, {
      foreignKey: 'idPerson',
    });

    Therapist.belongsTo(models.User, {
      foreignKey: 'idUser',
    });

  }

  return Therapist;
};