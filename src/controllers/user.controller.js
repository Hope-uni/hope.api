const logger = require('@config/logger.config');
const {
  allUsers,
  findUser,
  createUser,
  updateUser,
  deleteUser
} = require('@services/user.service');

const {
  createUserValidation,
  updateUserValidation
} = require('@validations/user.validation');
const { findOneValidation } = require('@validations/index.validation');


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
      logger.error(error);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `There was an error in User services: ${error}`,
      });
    }
  },

 /* The `async findUser(req, res)` function is responsible for handling the logic to find a specific
 user by their ID. Here's a breakdown of what it does: */
  async findUser(req,res) {
    try {

      // Joi Validation
      const { error } = findOneValidation({ id: req.params.id });
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
      logger.error(error);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `There was an error in User services: ${error}`,
      });
    }
  },

  /* The `async create(req, res)` function is responsible for handling the logic to create a new user.
  Here's a breakdown of what it does: */
  async create(req,res) {
    try {
      // Joi Validation
      const { error } = createUserValidation(req.body);
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
      logger.error(error);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `There was an error in User services: ${error}`,
      });
    }
  },


  /* The `async update(req, res)` function is responsible for handling the logic to update an existing
  user. Here's a breakdown of what it does: */
  async update(req,res) {
    try {
      // Joi Validation
      const { error } = updateUserValidation({ id: req.params.id, ...req.body });
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
      logger.error(error);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `There was an error in User services: ${error}`,
      });
    }
  },

  /* The `async removeUser(req, res)` function is responsible for handling the logic to delete a user
  by their ID. Here's a breakdown of what it does: */
  async removeUser(req,res) {
    try {
      // Joi Validation
      const { error } = findOneValidation({id: req.params.id});
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
      logger.error(error);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `There was an error in User services: ${error}`,
      });
    }
  },
}