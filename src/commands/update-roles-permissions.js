require('./command-line'); 
const { Permission, RolesPermission } = require('@models/index');
const logger = require('@config/logger.config');

/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
/* eslint-disable new-cap */

async function assignPermissionsRoles() {

  try {
    const permissionsData = await Permission.findAll({});


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

      //  Therapist
      if(
        permissionsData[i].description === 'listar pacientes' ||
        permissionsData[i].description === 'buscar pacientes' ||
        permissionsData[i].description === 'listar tutores' ||
        permissionsData[i].description === 'buscar tutores' ||
        permissionsData[i].description === 'actualizar terapeutas' 
      ) {
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
      if(
        permissionsData[i].description === 'listar pacientes' ||
        permissionsData[i].description === 'actualizar tutores'
      ) {
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