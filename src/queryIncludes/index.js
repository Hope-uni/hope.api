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
const {
    baseTherapistIncludes,
    therapistExistIncludes,
    patientTherapistIncludes,
    findTherapistIncludes,
    createAndUpdateTherapistIncludes,
} = require('./therapist.includes');


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

    // Therapist
    baseTherapistIncludes,
    therapistExistIncludes,
    patientTherapistIncludes,
    findTherapistIncludes,
    createAndUpdateTherapistIncludes,
}