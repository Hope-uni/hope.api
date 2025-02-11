const logger = require('@config/logger.config');
const { messages, formatJoiMessages } = require('@utils/index');
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

      // Joi Validation
      const { error } = authEntry.loginValidation(req.body);
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });	

      const { error:dataError, statusCode, message, data } = await login(req.body);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
        });
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.auth.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
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
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, statusCode, message} = await forgotPassword(req.body);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
        });
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message
      });

    } catch (error) {
      logger.error(`${messages.auth.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
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
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, message, statusCode, validationErrors } = await resetPassword(req.body,req.payload);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
          validationErrors,
        });
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message
      });
    } catch (error) {
      logger.error(`${messages.auth.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  async changePassword(req,res) {
    try {
      
      const { error } = authEntry.changePasswordValidation(req.body);
      if(error) return res.status(400).json({ 
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });


      const { error:dataError, message, statusCode, validationErrors } = await changePassword(req.body, req.payload);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
          validationErrors,
        });
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message
      });

    } catch (error) {
      logger.error(`${messages.auth.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  async changePasswordPatient(req,res) {
    try {

      const { error: idError } = idEntry.findOneValidation({id:req.params.id});

      const { error } = authEntry.changePasswordValidation(req.body);

      if(error || idError) {
        const idErrors = idError ? idError.details : [];
        const changePasswordErrors = error ? error.details : [];

        const joinErrors = {
          details: [
            ...idErrors,
            ...changePasswordErrors
          ]
        }

        return res.status(400).json({
          error: true,
          statusCode: 422,
          message: messages.generalMessages.bad_request,
          validationErrors: formatJoiMessages(joinErrors),
        });

      }

      const { error:dataError, message, statusCode, validationErrors } = await changePasswordPatient(req.body, req.params.id);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
          validationErrors,
        });
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message
      });

    } catch (error) {
      logger.error(`${messages.auth.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
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

      return res.status(statusCode).json({
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
        message: messages.generalMessages.server,
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

      return res.status(statusCode).json({
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
        message: messages.generalMessages.server,
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

      return res.status(statusCode).json({
        error,
        statusCode,
        message
      });

    } catch (error) {
      logger.error(`${messages.auth.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  }
}