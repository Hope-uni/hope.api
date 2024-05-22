const logger = require('@config/logger.config');
const { messages } = require('@utils/index');
const {
  login,
  forgotPassword,
  resetPassword,
  me,
  refreshAuth,
  removeRefreshToken,
  changePassword,
  changePasswordPatient
} = require('@services/auth.service');
const { authEntry, idEntry } = require('@validations/index');

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
          message: messages.auth.fields.username_email,
        })
      };

      // Joi Validation
      const { error } = authEntry.loginValidation(req.body);
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
      logger.error(`${messages.auth.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.auth.errors.controller}: ${error}`,
      });
    }
  },
  
  /* The `async forgotPassword(req,res)` function is a controller function that handles the process of
  resetting a user's forgotten password. Here is a breakdown of what it does: */
  async forgotPassword(req,res) {
    try {
      // Joi Validation
      const { error } = authEntry.forgotPasswordValidation(req.body);
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
      logger.error(`${messages.auth.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.auth.errors.controller}: ${error}`,
      });
    }
  },

  /* The `async resetPassword(req,res)` function is a controller function that handles the process of
  resetting a user's password. Here is a breakdown of what it does: */
  async resetPassword(req,res) {
    try { 
      // Joi Validation
      const { error } = authEntry.resetPasswordValidation(req.body);
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
      logger.error(`${messages.auth.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.auth.errors.controller}: ${error}`,
      });
    }
  },

  async changePassword(req,res) {
    try {
      
      const { error } = authEntry.changePasswordValidation(req.body);
      if(error) return res.status(400).json({ error: error.details[0].message });


      const { error:dataError, message, statusCode } = await changePassword(req.body, req.payload);

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
      logger.error(`${messages.auth.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.auth.errors.controller}: ${error}`,
      });
    }
  },

  async changePasswordPatient(req,res) {
    try {

      const { error: idError } = idEntry.findOneValidation({id:req.params.id});
      if(idError) return res.status(400).json({error: idError.details[0].message});

      const { error } = authEntry.changePasswordValidation(req.body);
      if(error) return res.status(400).json({ error: error.details[0].message });

      const { error:dataError, message, statusCode } = await changePasswordPatient(req.body, req.params.id);

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
      logger.error(`${messages.auth.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.auth.errors.controller}: ${error}`,
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
      logger.error(`${messages.auth.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.auth.errors.controller}: ${error}`,
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
      logger.error(`${messages.auth.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.auth.errors.controller}: ${error}`,
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
      logger.error(`${messages.auth.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.auth.errors.controller}: ${error}`,
      });
    }
  }
}