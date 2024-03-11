const jwt = require('jsonwebtoken');
const logger = require('@config/logger.config');
const { secretKey } = require('../config/variables.config');


module.exports = {
  /* eslint-disable consistent-return */
  async verifyToken(req,res,next) {
    try {
      
      const token = req.headers.authorization.split(' ')[1];
      if(!token) {
        return res.status(403).json({
          message: `Token no fue proveído`,
          error: true
        });
      };

      const payload = jwt.verify(token, secretKey);
      if(!payload) {
        return res.status(401).json({
          message: `Token Invalido`,
          error: true,
        });
      };

      req.payload = payload;
      next();
    } catch (error) {
      logger.error(`There was an error in verifyToken middleware: ${error}`);
      return res.status(401).json({
        message: `No autorizado`,
        error: true,
      });
    }

  }

}