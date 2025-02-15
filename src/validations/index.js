const idEntry = require('./findById.validation');
const authEntry = require('./auth.validation');
const userEntry = require('./user.validation');
const patientEntry = require('./patient.validation');
const therapistEntry = require('./therapist.validation');
const tutorEntry = require('./tutor.validation');
const roleEntry = require('./roles.validation');
const categoryEntry = require('./category.validation');
const pictogramEntry = require('./pictogram.validation');
const patientPictogramsEntry = require('./patientPictogram.validation');
const phaseEntry = require('./phase.validation');
const activityEntry = require('./activity.validation');


module.exports = {
  idEntry,
  authEntry,
  userEntry,
  patientEntry,
  therapistEntry,
  tutorEntry,
  roleEntry,
  categoryEntry,
  pictogramEntry,
  patientPictogramsEntry,
  phaseEntry,
  activityEntry,
}