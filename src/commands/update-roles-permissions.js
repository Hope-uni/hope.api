require('./command-line');
const { Permission, RolesPermission } = require('@models/index');
const logger = require('@config/logger.config');
const { permissionsConstants } = require('../constants');

/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
/* eslint-disable new-cap */

async function assignPermissionsRoles() {

  try {
    const permissionsData = await Permission.findAll({});


    const therapistPermissions = [
      // Patient
      permissionsConstants.GET_PATIENT,
      permissionsConstants.SEARCH_PATIENT,
      permissionsConstants.LIST_ASSIGNED_PATIENT,

      // Profile
      permissionsConstants.UPDATE_PROFILE,
      permissionsConstants.GET_PROFILE,

      // Category
      permissionsConstants.LIST_CATEGORY,

      // Pictogram
      permissionsConstants.SEARCH_PICTOGRAM,
      permissionsConstants.GET_PICTOGRAM,
      permissionsConstants.LIST_PICTOGRAM,

      // Phase
      permissionsConstants.LIST_PHASE,
      permissionsConstants.ADVANCE_PHASE,

      // Observation
      permissionsConstants.ADD_OBSERVATION,

      // Activity
      permissionsConstants.SEARCH_ACTIVITY,
      permissionsConstants.LIST_ACTIVITY,
      permissionsConstants.GET_ACTIVITY,
      permissionsConstants.ASSIGN_ACTIVITY,
      permissionsConstants.UNASSIGN_ACTIVITY,
      permissionsConstants.CREATE_ACTIVITY,
      permissionsConstants.DELETE_ACTIVITY,

      // Achievement
      permissionsConstants.LIST_ACHIEVEMENT,
      permissionsConstants.SEARCH_ACHIEVEMENT,
      permissionsConstants.ASSIGN_ACHIEVEMENT,
    ];

    const tutorPermissions = [
      // Patient
      permissionsConstants.GET_PATIENT,
      permissionsConstants.SEARCH_PATIENT,
      permissionsConstants.UPDATE_PATIENT,
      permissionsConstants.CHANGE_PASSWORD_ASSIGNED_PATIENT,
      permissionsConstants.LIST_ASSIGNED_PATIENT,

      // Profile
      permissionsConstants.UPDATE_PROFILE,
      permissionsConstants.GET_PROFILE,

      // Category
      permissionsConstants.LIST_CATEGORY,

      // Pictogram
      permissionsConstants.LIST_PICTOGRAM,
      permissionsConstants.CREATE_CUSTOM_PICTOGRAM,
      permissionsConstants.GET_CUSTOM_PICTOGRAM,
      permissionsConstants.UPDATE_CUSTOM_PICTOGRAM,
      permissionsConstants.DELETE_CUSTOM_PICTOGRAM,

      // HealthRecords
      permissionsConstants.CHANGE_MONOCHROME
    ];

    const adminPermissionsNotAllowed = [
      permissionsConstants.SEARCH_ROLE,
      permissionsConstants.CREATE_ROLE,
      permissionsConstants.UPDATE_ROLE,
      permissionsConstants.DELETE_ROLE,
      permissionsConstants.UPDATE_PROFILE,
      permissionsConstants.LIST_CUSTOM_PICTOGRAM,
      permissionsConstants.CHANGE_PASSWORD_ASSIGNED_PATIENT,
      permissionsConstants.LIST_ASSIGNED_PATIENT,
      permissionsConstants.VERIFY_ACTIVITY_ANSWER,
    ];

    const superAdminPermissionsNotAllowed = [
      permissionsConstants.UPDATE_PROFILE,
      permissionsConstants.LIST_CUSTOM_PICTOGRAM,
      permissionsConstants.LIST_ASSIGNED_PATIENT,
      permissionsConstants.VERIFY_ACTIVITY_ANSWER,
    ];

    const patientPermissions = [
      // Profile
      permissionsConstants.GET_PROFILE,

      // Category
      permissionsConstants.LIST_CATEGORY,

      // Pictogram
      permissionsConstants.LIST_CUSTOM_PICTOGRAM,

      // Activity
      permissionsConstants.VERIFY_ACTIVITY_ANSWER,
      permissionsConstants.GET_ACTIVITY
    ]

    for(let i=0; i<permissionsData.length; i++) {

      // SuperAdmin
      if(!superAdminPermissionsNotAllowed.includes(permissionsData[i].code)) {
        RolesPermission.findOne({
          where: {
            roleId: 1,
            permissionId: permissionsData[i].id
          }
        }).then((exist) => {
          if(!exist) {
            RolesPermission.create({
              roleId: 1,
              permissionId: permissionsData[i].id
            });
          }
        });
      }

      // Admin
      if(!adminPermissionsNotAllowed.includes(permissionsData[i].code)) {
        RolesPermission.findOne({
          where: {
            roleId: 2,
            permissionId: permissionsData[i].id
          }
        }).then((exist) => {
          if(!exist) {
            RolesPermission.create({
              roleId: 2,
              permissionId: permissionsData[i].id
            });
          }
        });
      }

      // Patient
      if(patientPermissions.includes(permissionsData[i].code)) {
        RolesPermission.findOne({
          where: {
            roleId: 4,
            permissionId: permissionsData[i].id
          }
        }).then((exist) => {
          if(!exist) {
            RolesPermission.create({
              roleId: 4,
              permissionId: permissionsData[i].id
            });
          }
        });
      }

      //  Therapist
      if(therapistPermissions.includes(permissionsData[i].code)) {
        RolesPermission.findOne({
          where: {
            roleId: 3,
            permissionId: permissionsData[i].id
          }
        }).then((exist) => {
          if(!exist) {
            RolesPermission.create({
              roleId: 3,
              permissionId: permissionsData[i].id
            });
          }
        });
      }

      // Tutor
      if(tutorPermissions.includes(permissionsData[i].code)) {
        RolesPermission.findOne({
          where: {
            roleId: 5,
            permissionId: permissionsData[i].id
          }
        }).then((exist) => {
          if(!exist) {
            RolesPermission.create({
              roleId: 5,
              permissionId: permissionsData[i].id
            });
          }
        });
      }


    }
  } catch (error) {
    logger.error(`There was an error in update-roles-permissions command: ${error}`);
    throw new error;
  }
}

assignPermissionsRoles();
