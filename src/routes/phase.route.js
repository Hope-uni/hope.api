const router = require('express').Router();
const  {
  allPhases,
  udpatePhase,
  patientPhaseShifting
} = require('@controllers/phase.controller');
const { verifyToken, rolePermissions } = require('@middlewares/index');
const {
  roleConstants: { SUPERADMIN_ROLE, ADMIN_ROLE, THERAPIST_ROLE },
  permissionsConstants: {
    UPDATE_PHASE,
    LIST_PHASE,
    ADVANCE_PHASE
  }
} = require('../constants');


router.put('/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE],[UPDATE_PHASE]), udpatePhase);

router.get('', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, THERAPIST_ROLE],[LIST_PHASE]), allPhases);

router.put('/phase-shift/:id', verifyToken, rolePermissions([SUPERADMIN_ROLE, ADMIN_ROLE, THERAPIST_ROLE],[ADVANCE_PHASE]), patientPhaseShifting );



module.exports = router;
