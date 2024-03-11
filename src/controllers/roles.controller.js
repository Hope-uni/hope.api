const logger = require('@config/logger.config');
const { 
  allRoles,
  findRole,
  createRole,
  updateRole,
  deleteRole,
} = require('@services/roles.service');
const { 
  createRoleValidation,
  findRoleValidation,
  updateRoleValidation
} = require('@validations/roles.validation');

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
      
      const { error, data, message } = await allRoles();

      if(error) {
        return res.status(400).json({
          error,
          message
        });
      };

      return res.status(200).json({
        error,
        message,
        data
      });

    } catch (error) {
      logger.error(error.message);
      return {
        message: `There was an error in Role Controller: ${error.message}`,
        error: true
      };
    }
  },


  /**
   * The function `findOne` in this JavaScript code snippet handles finding a role based on a given ID
   * and returns the result in a JSON response.
   * @returns The `findOne` function returns different responses based on the conditions:
   */
  async findOne(req,res) {
    try {
      
      const { error } = findRoleValidation({id:req.params.id});
      if(error) return res.status(400).json({ error: error.details[0].message });

      const { error: dataError, message, data } = await findRole(req.params.id);
      if(dataError) {
        return res.status(400).json({
          error:dataError,
          message
        });
      };

      return res.status(200).json({
        error: dataError,
        message,
        data
      });

    } catch (error) {
      logger.error(error.message);
      return {
        message: `There was an error in Role Controller: ${error.message}`,
        error: true
      };
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
      
      const { error } = createRoleValidation(req.body);
      if(error) return res.status(400).json({ error: error.details[0].message });

      const { error: dataError, message, data } = await createRole(req.body);
      if(dataError) {
        return res.status(400).json({
          error,
          message
        });
      };

      return res.status(200).json({
        error: dataError,
        message,
        data
      });

    } catch (error) {
      logger.error(error.message);
      return {
        message: `There was an error in Role Controller: ${error.message}`,
        error: true
      };
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
      
      const { error } = updateRoleValidation({id:req.params.id,...req.body});
      if(error) return res.status(400).json({ error: error.details[0].message });

      const { error:dataError, message, data } = await updateRole(req.params.id,req.body);
      if(dataError) {
        return res.status(400).json({
          error,
          message
        });
      };

      return res.status(200).json({
        error: dataError,
        message,
        data
      });

    } catch (error) {
      logger.error(error.message);
      return {
        message: `There was an error in Role Controller: ${error.message}`,
        error: true
      };
    }
  },

  /**
   * The function `deleteRole` handles the deletion of a role, including validation and error handling.
   * @returns The `deleteRole` function is returning different responses based on the outcome of the
   * operations within the try block:
   */
  async deleteRole(req,res) {
    try {
      const { error } = findRoleValidation({id:req.params.id});
      if(error) return res.status(400).json({ error: error.details[0].message });

      const { message, error:dataError } = await deleteRole(req.params.id);
      if(dataError) {
        return res.status(400).json({
          error,
          message
        });
      };

      return res.status(200).json({
        error,
        message
      });

    } catch (error) {
      return {
        message: `There was an error in Role Controller: ${error.message}`,
        error: true
      };
    }
  }

}