const logger = require('@config/logger.config');
const {
  allUsers,
  findUser,
  createUser,
  updateUser,
  deleteUser,
  addRoleUser,
  removeRoleUser,
} = require('@services/user.service');
const {
  idEntry,
  userEntry
} = require('@validations/index');
const { messages, formatJoiMessages } = require('@utils/index');


module.exports = {


  /* This `async all(req, res)` function is handling the logic for retrieving all users. Here's a
  breakdown of what it does: */
  async all(req,res) {
    try {
      const { error, message, statusCode, ...resData } = await allUsers(req.query);

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
        ...resData
      });

    } catch (error) {
      logger.error(`${messages.user.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

 /* The `async findUser(req, res)` function is responsible for handling the logic to find a specific
 user by their ID. Here's a breakdown of what it does: */
  async findUser(req,res) {
    try {

      // Joi Validation
      const { error } = idEntry.findOneValidation({ id: req.params.id });
      if(error) return res.status(400).json({ error: error.details[0].message });
      
      const { error:dataError, message, statusCode, data} = await findUser(req.params.id);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message
        })
      };

      return res.status(statusCode).json({
        error:dataError,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.user.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  /* The `async create(req, res)` function is responsible for handling the logic to create a new user.
  Here's a breakdown of what it does: */
  async create(req,res) {
    try {
      // Joi Validation
      const { error } = userEntry.createUserValidation(req.body);
      if(error) return res.status(400).json({ error: error.details[0].message });
      const { error:dataError, statusCode, message, validationErrors, data } = await createUser(req.body);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
          validationErrors,
        })
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.user.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },


  /* The `async update(req, res)` function is responsible for handling the logic to update an existing
  user. Here's a breakdown of what it does: */
  async update(req,res) {
    try {
      // Joi Validation
      const { error } = userEntry.updateUserValidation({ ...req.body });
      if(error) return res.status(400).json({ 
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });
      
      const { error:dataError, statusCode, message, validationErrors, data} = await updateUser(req.params.id,req.body);

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
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.user.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  /* The `async removeUser(req, res)` function is responsible for handling the logic to delete a user
  by their ID. Here's a breakdown of what it does: */
  async removeUser(req,res) {
    try {
      // Joi Validation
      const { error } = idEntry.findOneValidation({id: req.params.id});
      if(error) return res.status(400).json({ 
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, statusCode, message } = await deleteUser(req.params.id);
      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
        });
      };

      return res.status(statusCode).json({
        error: false,
        statusCode,
        message,
      });
    } catch (error) {
      logger.error(`${messages.user.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  /* The `async addRolesUser(req, res)` function is responsible for handling the logic to add a role to
  a user. Here's a breakdown of what it does: */
  async addRolesUser(req,res) {
    try {

      const { error } = userEntry.roleUserValidation(req.body);
      if(error) return res.status(400).json({ 
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, statusCode, message, data } = await addRoleUser(req.body.userId,req.body.roleId);
      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
        });
      }

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.user.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },
  
  async removeRolesUser(req,res) {
    try {
      
      const { error } = userEntry.roleUserValidation(req.body);
      if(error) return res.status(400).json({ 
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, statusCode, message } = await removeRoleUser(req.body.userId,req.body.roleId);
      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
        });
      }

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
      });
    } catch (error) {
      logger.error(`${messages.user.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  }

}