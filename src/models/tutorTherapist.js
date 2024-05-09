const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TutorTherapist extends Model {}
  TutorTherapist.init({
    identificationNumber: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: 'TutorTherapist',
  });

  TutorTherapist.associate = (models) => {

    TutorTherapist.belongsTo(models.Person, {
      foreignKey: 'personId',
    });

    TutorTherapist.belongsTo(models.User, {
      foreignKey: 'userId',
    });
  }

  return TutorTherapist;
};