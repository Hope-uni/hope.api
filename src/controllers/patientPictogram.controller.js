const logger = require('@config/logger.config');
const {
  messages,
  formatJoiMessages
} = require('@utils/index');
const {
  all,
  allCustomPictograms,
  createPatientPictogram,
  updatePatientPictogram,
  removePatientPictogram,
} = require('@services/patientPictograms.service');
const {
  patientPictogramsEntry,
  idEntry,
} = require('@validations/index');

module.exports = {

  async all(req,res) {
    try {
      
      // validate each field from the request except the paginations fields and the tutor enum
      const { page, size, tutor, ...resQuery } = req.query;

      const { error } = patientPictogramsEntry.patientPictogramsFilterValidation(resQuery);
      if( error ) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, message, statusCode, ...resData } = await all(req.query, req.payload);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message
        });
      }

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        ...resData
      });

    } catch (error) {
      logger.error(`${messages.pictogram.errors.controller2}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.pictogram.errors.controller2}: ${error}`
      });
    }
  },

  async allCustomPictograms(req,res) {
    try {
      
      // validate each field from the request except the paginations fields and the tutor enum
      const { page, size, tutor, ...resQuery } = req.query;

      const { error } = patientPictogramsEntry.patientPictogramsFilterValidation(resQuery);
      if( error ) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: error.details[0].message,
      });

      const { error:dataError, message, statusCode, ...resData } = await allCustomPictograms(req.query, req.payload);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message
        });
      }

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        ...resData
      });

    } catch (error) {
      logger.error(`${messages.pictogram.errors.controller2}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.pictogram.errors.controller2}: ${error}`
      });
    }
  },

  async create(req,res) {
    try {
      
      const { error } = patientPictogramsEntry.createPatientPictogram(req.body);
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, statusCode, message, validationErrors, data } = await createPatientPictogram(req.body);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
          validationErrors
        });
      }

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.pictogram.errors.controller2}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      });
    }
  },

  async update(req,res) {
    try {
      
      const { error } = patientPictogramsEntry.updatePatientPictogram({id:req.params.id, ...req.body});
      if(error) return res.status(400).json({
        error: true,
        message: messages.generalMessages.bad_request,
        statusCode: 422,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, statusCode, message, validationErrors, data } = await updatePatientPictogram(req.params.id,req.body);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
          validationErrors
        });
      }

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.pictogram.errors.controller2}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      });
    }
  },


  async removePatientPictogram(req,res) {
    try {
      
      const { error } = idEntry.findOneValidation({id: req.params.id});
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, statusCode, message } = await removePatientPictogram(req.params.id);

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message
        });
      }

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message
      });

    } catch (error) {
      logger.error(`${messages.pictogram.errors.controller2}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      });
    }
  },

}