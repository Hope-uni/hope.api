const router = require('express').Router();
const {
  allActivities,
  createActivity,
  assignActivity,
  findActivity,
  checkActivityPatient,
  unAssignActivity,
  deleteActivity,
  currentPatientActivity,
} = require('@controllers/activity.controller');
const { verifyToken, rolePermissions } = require('@middlewares');
const {
  roleConstants: { ADMIN_ROLE, SUPERADMIN_ROLE, THERAPIST_ROLE, PATIENT_ROLE },
  permissionsConstants: {
    LIST_ACTIVITY,
    GET_ACTIVITY,
    CREATE_ACTIVITY,
    ASSIGN_ACTIVITY,
    UNASSIGN_ACTIVITY,
    VERIFY_ACTIVITY_ANSWER,
    DELETE_ACTIVITY
  }
} = require('@constants');


router.get('/', verifyToken, rolePermissions([ADMIN_ROLE, SUPERADMIN_ROLE, THERAPIST_ROLE],[LIST_ACTIVITY]), allActivities);
router.get('/current-activity', verifyToken, rolePermissions([PATIENT_ROLE],[GET_ACTIVITY]), currentPatientActivity);
router.get('/:id', verifyToken, rolePermissions([ADMIN_ROLE, SUPERADMIN_ROLE, THERAPIST_ROLE],[GET_ACTIVITY]), findActivity);

router.post('/', verifyToken, rolePermissions([ADMIN_ROLE, SUPERADMIN_ROLE, THERAPIST_ROLE],[CREATE_ACTIVITY]), createActivity);
router.post('/assign', verifyToken, rolePermissions([ADMIN_ROLE, SUPERADMIN_ROLE, THERAPIST_ROLE],[ASSIGN_ACTIVITY]), assignActivity);
router.post('/unassign', verifyToken, rolePermissions([ADMIN_ROLE, SUPERADMIN_ROLE, THERAPIST_ROLE],[UNASSIGN_ACTIVITY]), unAssignActivity);
router.post('/check', verifyToken, rolePermissions([PATIENT_ROLE],[VERIFY_ACTIVITY_ANSWER]), checkActivityPatient);

router.delete('/:id', verifyToken, rolePermissions([ADMIN_ROLE, SUPERADMIN_ROLE, THERAPIST_ROLE],[DELETE_ACTIVITY]), deleteActivity);

module.exports = router;
