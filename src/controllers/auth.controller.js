const logger = require('@config/logger.config');
const {
  login,
  forgotPassword,
  resetPassword,
  me,
  refreshAuth,
  removeRefreshToken
} = require('@services/auth.service');

const { 
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('@validations/auth.validation');

module.exports = {

  /* The `async login(req,res)` function is a controller function that handles the login process. Here
  is a breakdown of what it does: */
  async login(req,res) {
    try {

      // Username | email validation
      if(!req.body.username && !req.body.email) {
        return res.status(400).json({
          error: true,
          statusCode: 400,
          message: 'Nombre de usuario o correo es necesario para iniciar sesión',
        })
      };

      // Joi Validation
      const { error } = loginValidation(req.body);
      if(error) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: error.details[0].message,
      });	

      const { error:dataError, statusCode, message , data } = await login(req.body);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message
        });
      };

      return res.status(200).json({
        error: dataError,
        statusCode: 200,
        message,
        data
      });

    } catch (error) {
      logger.error(error);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `There was an error in login controller: ${error}`,
      });
    }
  },
  
  /* The `async forgotPassword(req,res)` function is a controller function that handles the process of
  resetting a user's forgotten password. Here is a breakdown of what it does: */
  async forgotPassword(req,res) {
    try {
      // Joi Validation
      const { error } = forgotPasswordValidation(req.body);
      if(error) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: error.details[0].message,
      });

      const { error:dataError, statusCode, message } = await forgotPassword(req.body);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message
        });
      };

      return res.status(200).json({
        error: dataError,
        statusCode: 200,
        message
      });

    } catch (error) {
      logger.error(error);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `There was an error in forgot password controller: ${error}`,
      });
    }
  },

  /* The `async resetPassword(req,res)` function is a controller function that handles the process of
  resetting a user's password. Here is a breakdown of what it does: */
  async resetPassword(req,res) {
    try { 
      // Joi Validation
      const { error } = resetPasswordValidation(req.body);
      if(error) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: error.details[0].message,
      });

      const { error:dataError, message, statusCode } = await resetPassword(req.body,req.payload);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message
        });
      };

      return res.status(200).json({
        error: dataError,
        statusCode: 200,
        message
      });
    } catch (error) {
      logger.error(`There was an error in reset password controller: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `There was an error in reset password controller: ${error}`,
      });
    }
  },

  /* The `async me(req,res)` function is a controller function that handles the process of retrieving
  user information. Here is a breakdown of what it does: */
  async me(req,res) {
    try {
      const { error, message , statusCode, data } = await me(req.payload);

      if(error) {
        return res.status(statusCode).json({
          error,
          statusCode,
          message
        });
      };

      return res.status(200).json({
        error,
        statusCode: 200,
        message,
        data
      });
    } catch (error) {
      logger.error(error);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `There was an error in Me controller: ${error}`,
      });
    }
  },

  /* The `async getRefreshToken(req,res)` function is a controller function that handles the process of
  refreshing the authentication token. Here is a breakdown of what it does: */
  async getRefreshToken(req,res) {
    try {
      
      const { error, message, statusCode, data } = await refreshAuth(req.body.refreshToken);
      if(error) {
        return res.status(statusCode).json({
          error,
          statusCode,
          message
        });
      };

      return res.status(200).json({
        error,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`There was an error in RefreshToken controller: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `There was an error in RefreshToken controller: ${error}`,
      });
    }
  },

  async removeToken(req,res) {
    try {
      
      const { error, message, statusCode } = await removeRefreshToken(req.body.refreshToken);
      if(error) {
        return res.status(statusCode).json({
          error,
          statusCode,
          message
        });
      };

      return res.status(200).json({
        error,
        statusCode: 200,
        message
      });

    } catch (error) {
      logger.error(`There was an error in removeRefreshToken controller: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `There was an error in removeRefreshToken controller: ${error}`,
      });
    }
  }
}