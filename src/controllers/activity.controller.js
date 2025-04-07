const logger = require('@config/logger.config');
const {
  all,
  findOne,
  create,
  unAssignActivityPatient,
  checkActivityAnswer,
  deleteActivity,
  assingActivityPatient,
  currentPatientActivity
} = require('@services/activity.service');
const { messages, formatJoiMessages } = require('@utils');
const {
  activityEntry,
  idEntry,
  paginationEntry
} = require('@validations');



module.exports = {

  async allActivities(req,res) {
    try {

      const { error } = paginationEntry(req.query);
      if(error) {
        return res.status(400).json({
          error: true,
          statusCode: 422,
          message: error.details[0].message
        });
      }

      const { error:dataError, message, statusCode, ...data } = await all(req.query);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message
        });
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        ...data
      });

    } catch (error) {
      logger.error(`${messages.activity.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      });
    }
  },


  async findActivity(req,res) {
    try {

      const { error } = idEntry.findOneValidation({ id:req.params.id }, messages.activity.fields.id);
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: error.details[0].message
      });

      const { error:dataError, statusCode, message, data } = await findOne(req.params.id);
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
      logger.error(`${messages.activity.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      });
    }
  },

  async createActivity(req,res) {
    try {

      const { error } = activityEntry.createActivityValidation(req.body);
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error)
      });

      const { error:dataError, statusCode, message, validationErrors, data } = await create(req.body, req.payload);

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
      logger.error(`${messages.activity.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      });
    }
  },

  async deleteActivity(req,res) {
    try {

      const { error } = idEntry.findOneValidation({ id:req.params.id }, messages.activity.fields.id);
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: error.details[0].message
      });

      const { error:dataError, statusCode, message } = await deleteActivity(req.params.id, req.payload);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message
        })
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
      });

    } catch (error) {
      logger.error(`${messages.activity.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      });
    }
  },

  async assignActivity(req,res) {
    try {

      const { error } = activityEntry.assignActivityPatientValidation(req.body);
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: error.details[0].message,
      });

      const { error:dataError, statusCode, message } = await assingActivityPatient(req.body, req.payload);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
        })
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
      });

    } catch (error) {
      logger.error(`${messages.activity.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      });
    }
  },

  async unAssignActivity(req,res) {
    try {

      const { error } = activityEntry.unAssignActivityPatinetValidation(req.body);
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: error.details[0].message
      });

      const { error:dataError, statusCode, message, data } = await unAssignActivityPatient(req.body, req.payload);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
        })
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.activity.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      });
    }
  },


  async checkActivityPatient(req,res) {
    try {

      const { error } = activityEntry.checkActivityPatientValidation(req.body);
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: error.details[0].message
      });

      const { error:dataError, statusCode, message } = await checkActivityAnswer(req.body, req.payload);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message
        })
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message
      });

    } catch (error) {
      logger.error(`${messages.activity.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      });
    }
  },

  async currentPatientActivity(req,res) {
    try {

      const { error:dataError, statusCode, message, data } = await currentPatientActivity(req.payload);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message
        })
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.activity.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      });
    }
  }

}
