const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Patient extends Model {}
  Patient.init({
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Patient',
  });

  Patient.associate = (models) => {
    
    Patient.belongsTo(models.Person, {
      foreignKey: 'personId'
    });

    Patient.belongsTo(models.User, {
      foreignKey: 'userId'
    });

    Patient.belongsTo(models.TutorTherapist, {
      as: 'tutor',
      foreignKey: 'tutorId'
    });

    Patient.belongsTo(models.TutorTherapist, {
      as: 'therapist',
      foreignKey: 'therapistId'
    });

    Patient.hasMany(models.PatientPictogram, {
      foreignKey: 'patientId'
    })

    Patient.hasOne(models.HealthRecord, {
      foreignKey: 'patientId'
    });

    Patient.hasMany(models.PatientActivity, {
      foreignKey: 'patientId'
    });

  }

  return Patient;
};