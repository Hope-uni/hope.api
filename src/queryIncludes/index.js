const { 
    basePatientIncludes, 
    patientActivityIncludes, 
    findPatientIncludes,
    getTutorTherapistsPatientIncludes, 
} = require('./patient.includes');
const { 
    baseTutorIncludes,
    tutorExistIncludes,
    patientTutorIncludes,
    findTutorIncludes,
} = require('./tutor.includes');


module.exports = {
    // Patient
    basePatientIncludes,
    patientActivityIncludes,
    findPatientIncludes,
    getTutorTherapistsPatientIncludes,

    // Tutor
    baseTutorIncludes,
    tutorExistIncludes,
    patientTutorIncludes,
    findTutorIncludes,
}