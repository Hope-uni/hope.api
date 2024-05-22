
const idEntry = require('./findById.validation');
const authEntry = require('./auth.validation');
const userEntry = require('./user.validation');
const patientEntry = require('./patient.validation');
const therapistEntry = require('./therapist.validation');
const tutorEntry = require('./tutor.validation');
const roleEntry = require('./roles.validation');
const categoryEntry = require('./category.validation');



module.exports = {
  idEntry,
  authEntry,
  userEntry,
  patientEntry,
  therapistEntry,
  tutorEntry,
  roleEntry,
  categoryEntry,
}