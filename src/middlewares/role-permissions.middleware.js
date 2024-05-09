const { User, Role, Permission, UserRoles } = require('@models/index');

module.exports = function rolePermissions(permittedRoles,permittedPermissions) {

  /* eslint-disable no-unused-vars */
    /* eslint-disable array-callback-return */
    /* eslint-disable no-restricted-syntax */
    /* eslint-disable no-loop-func */
  return async (request, response, next) => {
    const { id } = request.payload;
    const user = await User.findByPk(id,{
      include: [
        {
          model: UserRoles,
          include: [
            {
              model: Role,
              attributes: {
                exclude: ['createdAt','updatedAt','status']
              },
              include: {
                model: Permission,
                as: 'permissions',
                attributes: {
                  exclude: ['group','createdAt','updatedAt']
                },
                through: {
                  attributes: {
                    exclude: [
                      'id',
                      'createdAt',
                      'updatedAt',
                      'roleId',
                      'permissionId',
                    ]
                  }
                }
              }
            }
          ]
        }
      ]
    });

    // Admin Validation

    // Variables
    let getAdmin; // Admin validation
    let havePermission; // Permission validation
    let haveRole = false;

    user.UserRoles.some((rolElement) => {
      if(rolElement.Role.name === 'Superadmin' || rolElement.Role.name === 'Admin') {
        getAdmin = rolElement.Role.name;
      }
    });

    if(getAdmin === 'Superadmin' || getAdmin === 'Admin') {
      next();
      return;
    }
    // Role validation
    user.UserRoles.map((element ) => {
      if(permittedRoles.includes(element.Role.name)) {
        haveRole = true;
      }
    });
    
    for (const iterator of permittedPermissions) {
      user.UserRoles.map((element) => {
        element.Role.permissions.some((permission) => {
          if(permission.description === iterator) {
            havePermission = true
          }
        });
      });
    }
    

    if(user && haveRole && havePermission) {
      next();
    } else {
      response.status(403).json({
        error: true,
        statusCode: 403,
        message: 'Acceso Denegado' 
      }); // user is forbidden
    }

  }

}