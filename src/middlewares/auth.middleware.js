const jwt = require('jsonwebtoken');
const { User, UserRoles, Role } = require('@models/index');
const logger = require('@config/logger.config');
const { secretKey } = require('@config/variables.config');
const { messages } = require('@utils');


module.exports = {
  /* eslint-disable consistent-return */
  async verifyToken(req,res,next) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      if(!token) {
        return res.status(403).json({
          error: true,
          statusCode: 403,
          message: `Token no fue proveído`,
        });
      };
      const payload = jwt.verify(token, secretKey);
      if(!payload) {
        return res.status(401).json({
          error: true,
          statusCode: 401,
          message: `Token Inválido`,
        });
      };

      // Validate if user is verified
      const validUser = await User.findOne({
        where: {
          id: payload.id,
          status: true,
        },
        include: [
            {
              model: UserRoles,
            attributes: {
              exclude: ['userId', 'roleId','createdAt','updatedAt']
            },
            include: [
              {
                model: Role,
                attributes: {
                  exclude: ['createdAt','updatedAt','status']
                },
              }
            ]
          }
        ]
      });

      if(validUser.userVerified === false && req.path !== '/change-password') {
        return res.status(403).json({
          error: true,
          statusCode: 403,
          message: messages.user.errors.user_verified,
          data: {
            role: {
              id: validUser.UserRoles[0].Role.id,
              name: validUser.UserRoles[0].Role.name,
            },
          }
        });
      }

      // add role to payload
      if(validUser.userVerified === true) {
        const roles = validUser.UserRoles.map(item => item.Role.name);
        payload.roles = roles;
      }

      req.payload = payload;
      next();
    } catch (error) {
      logger.error(`There was an error in verifyToken middleware: ${error}`);
      return res.status(401).json({
        error: true,
        statusCode: 401,
        message: `No autorizado`,
      });
    }

  }

}
