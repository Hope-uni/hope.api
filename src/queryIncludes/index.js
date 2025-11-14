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
const {
    baseActivityIncludes,
    patientAssignActivityIncludes,
    patientUnAssignActivityIncludes,
    patientCurrentActivityIncludes,
} = require('./activity.includes');
const {
    userLoginIncludes,
    meIncludes,
} = require('./auth.includes');
const {
    baseCustomPictogramsIncludes,
    patientCustomPictogramsIncludes,
    allPictogramsIncludes,
} = require('./customPictograms.includes');


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

    // Activity
    baseActivityIncludes,
    patientAssignActivityIncludes,
    patientUnAssignActivityIncludes,
    patientCurrentActivityIncludes,

    // Auth
    userLoginIncludes,
    meIncludes,

    // Custom Pictograms
    baseCustomPictogramsIncludes,
    patientCustomPictogramsIncludes,
    allPictogramsIncludes,
}