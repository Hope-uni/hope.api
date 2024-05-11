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
const messages = require('@utils/messages.utils');


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

      return res.status(200).json({
        error,
        statusCode: 200,
        message,
        ...resData
      });

    } catch (error) {
      logger.error(`${messages.user.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.user.errors.controller}: ${error}`,
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

      return res.status(200).json({
        error:dataError,
        statusCode: 200,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.user.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.user.errors.controller}: ${error}`,
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
      const { error:dataError, statusCode, message, data } = await createUser(req.body);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message
        })
      };

      return res.status(200).json({
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
        message: `${messages.user.errors.controller}: ${error}`,
      });
    }
  },


  /* The `async update(req, res)` function is responsible for handling the logic to update an existing
  user. Here's a breakdown of what it does: */
  async update(req,res) {
    try {
      // Joi Validation
      const { error } = userEntry.updateUserValidation({ ...req.body });
      if(error) return res.status(400).json({ error: error.details[0].message });
      
      const { error:dataError, statusCode, message, data} = await updateUser(req.params.id,req.body);

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
      logger.error(`${messages.user.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.user.errors.controller}: ${error}`,
      });
    }
  },

  /* The `async removeUser(req, res)` function is responsible for handling the logic to delete a user
  by their ID. Here's a breakdown of what it does: */
  async removeUser(req,res) {
    try {
      // Joi Validation
      const { error } = idEntry.findOneValidation({id: req.params.id});
      if(error) return res.status(400).json({ error: error.details[0].message });

      const { error:dataError, statusCode, message} = await deleteUser(req.params.id);
      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message
        });
      };

      return res.status(200).json({
        error: false,
        statusCode: 200,
        message,
      });
    } catch (error) {
      logger.error(`${messages.user.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.user.errors.controller}: ${error}`,
      });
    }
  },

  /* The `async addRolesUser(req, res)` function is responsible for handling the logic to add a role to
  a user. Here's a breakdown of what it does: */
  async addRolesUser(req,res) {
    try {

      const { error } = userEntry.roleUserValidation(req.body);
      if(error) return res.status(400).json({ error: error.details[0].message });

      const { error:dataError, statusCode, message, data } = await addRoleUser(req.body.userId,req.body.roleId);
      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message
        });
      }

      return res.status(200).json({
        error: dataError,
        statusCode: 200,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.user.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.user.errors.controller}: ${error}`,
      });
    }
  },
  
  async removeRolesUser(req,res) {
    try {
      
      const { error } = userEntry.roleUserValidation(req.body);
      if(error) return res.status(400).json({ error: error.details[0].message });

      const { error:dataError, statusCode, message } = await removeRoleUser(req.body.userId,req.body.roleId);
      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message
        });
      }

      return res.status(200).json({
        error: dataError,
        statusCode: 200,
        message,
      });
    } catch (error) {
      logger.error(`${messages.user.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.user.errors.controller}: ${error}`,
      });
    }
  }

}