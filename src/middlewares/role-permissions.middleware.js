const { User, Role, Permission } = require('@models/index');

module.exports = function rolePermissions(permittedRoles,permittedPermissions) {

  return async (request, response, next) => {
    const { id } = request.payload;
    const user = await User.findByPk(id,{
      include: [
        {
          model: Role,
          include: [
            {
              model: Permission,
              as: 'permissions'
            }
          ]
        }
      ]
    });

    // Admin Validation
    if(user.Role.name === 'Superadmin') {
      next();
      return;
    }
    // Role validation
    const haveRole = permittedRoles.includes(user.Role.name);

    // Permission validation
    let havePermission;
    
    /* eslint-disable array-callback-return */
    /* eslint-disable no-restricted-syntax */
    /* eslint-disable no-loop-func */
    for (const iterator of permittedPermissions) {
      user.Role.permissions.some((permission) => {
        if(permission.description === iterator){
          havePermission = true;
        }
      })
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