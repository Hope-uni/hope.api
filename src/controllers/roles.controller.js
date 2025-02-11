const logger = require('@config/logger.config');
const { 
  allRoles,
  findRole,
  createRole,
  updateRole,
  deleteRole,
} = require('@services/roles.service');
const { 
  roleEntry,
  idEntry
} = require('@validations/index');
const { messages, formatJoiMessages } = require('@utils/index');

module.exports = {

  /**
   * The function "all" retrieves all roles and returns them in a JSON response, handling errors
   * appropriately.
   * @returns The `all` function is returning either a JSON response with error, message, and data if
   * the `allRoles` function is successful, or a JSON response with error and message if there is an
   * error. If there is an error caught in the try-catch block, it logs the error using a logger and
   * returns an object with an error message indicating the error in the Role Controller.
   */
  async all(req,res) {
    try {
      
      const { error, statusCode, message, ...resData } = await allRoles(req.query);

      if(error) {
        return res.status(400).json({
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
      logger.error(`${messages.role.errors.controller}: ${error.message}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.role.errors.controller}: ${error.message}`,
      });
    }
  },


  /**
   * The function `findOne` in this JavaScript code snippet handles finding a role based on a given ID
   * and returns the result in a JSON response.
   * @returns The `findOne` function returns different responses based on the conditions:
   */
  async findOne(req,res) {
    try {
      
      const { error } = idEntry.findOneValidation({id:req.params.id});
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error: dataError, statusCode, message, data } = await findRole(req.params.id);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message
        });
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.role.errors.controller}: ${error.message}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  /**
   * The function `create` handles the creation of a role, including validation, error handling, and
   * response generation.
   * @returns The `create` function returns different responses based on the outcome of the validation
   * and creation processes:
   */
  async create(req,res) {
    try {
      
      const { error } = roleEntry.createRoleValidation(req.body);
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error: dataError, statusCode, message, validationErrors, data } = await createRole(req.body);
      if(dataError) {
        return res.status(statusCode).json({
          error,
          statusCode,
          message,
          validationErrors
        });
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.role.errors.controller}: ${error.message}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

 /**
  * The function `update` in this JavaScript code snippet handles updating a role, including validation
  * and error handling.
  * @returns The `update` function returns different responses based on the outcome of the update
  * operation:
  */
  async update(req,res) {
    try {
      
      const { error } = roleEntry.updateRoleValidation({id:req.params.id,...req.body});
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, statusCode, message, validationErrors, data } = await updateRole(req.params.id,req.body);
      if(dataError) {
        return res.status(statusCode).json({
          error,
          statusCode,
          message,
          validationErrors
        });
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.role.errors.controller}: ${error.message}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  /**
   * The function `deleteRole` handles the deletion of a role, including validation and error handling.
   * @returns The `deleteRole` function is returning different responses based on the outcome of the
   * operations within the try block:
   */
  async deleteRole(req,res) {
    try {
      const { error } = idEntry.findOneValidation({id:req.params.id});
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { message, statusCode, error:dataError } = await deleteRole(req.params.id);
      if(dataError) {
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
      logger.error(`${messages.role.errors.controller}: ${error.message}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  }

}