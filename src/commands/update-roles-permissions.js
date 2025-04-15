require('./command-line');
const { Permission, RolesPermission } = require('@models/index');
const logger = require('@config/logger.config');

/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
/* eslint-disable new-cap */

async function assignPermissionsRoles() {

  try {
    const permissionsData = await Permission.findAll({});


    const therapistPermissions = [
      'listar pacientes',
      'buscar pacientes',
      // 'listar tutores',
      // 'buscar tutores',
      'actualizar perfil',
      'buscarme',
      'modificar paciente-terapeuta',
      'listar pictogramas',
      'buscar pictogramas',
      // 'listar pictogramas-personalizados',
      'listar actividades',
      'buscar actividades',
      'crear actividades',
      'crear observaciones',
      'actualizar actividades',
      'borrar actividades',
      'desasignar-actividad',
      'asignar-actividad',
      'listar categorias',
      'listar fases',
      'asignar-logros',
      'listar logros',
      'buscar logros',
    ]

    const tutorPermissions = [
      'listar pacientes',
      'buscar pacientes',
      'actualizar perfil',
      // 'actualizar pacientes',
      'buscarme',
      'modificar paciente-tutor',
      'listar pictogramas-personalizados',
      'crear pictogramas-personalizados',
      'actualizar pictogramas-personalizados',
      'borrar pictogramas-personalizados',
      'listar categorias',
    ]

    const patientPermissions = [
      'listar pictogramas-personalizados',
      'verify-activity-answer',
      'listar categorias',
      'listar actividades',
    ]

    for(let i=0; i<permissionsData.length; i++) {

      // SuperAdmin
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

      // Admin
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

      // Patient
      if(patientPermissions.includes(permissionsData[i].description)) {
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
      if(therapistPermissions.includes(permissionsData[i].description)) {
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
      if(tutorPermissions.includes(permissionsData[i].description)) {
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
