const { Op } = require('sequelize');
const { PatientPictogram, Patient, Pictogram, Category, sequelize } = require('@models/index');
const logger = require('@config/logger.config');
const { messages, dataStructure, formatErrorMessages } = require('@utils/index');
const { getPictogramsPatient, getPictogramsPatientTutor } = require('@helpers/patientPictogram.helper');


module.exports = {

  async all(query, payload) {
    try {
      
      if(query.tutor) {
        return await getPictogramsPatientTutor(payload, query);
      }

      return await getPictogramsPatient(payload,query);

    } catch (error) {
      logger.error(`${messages.pictogram.errors.service.base2}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

  async createPatientPictogram(body) {
    const transaction = await sequelize.transaction();
    try {
      
      // get Patient
      const patientResponse = await Patient.findOne({
        where: {
          status: true,
          id: body.patientId
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        }
      });
      if(!patientResponse) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('patient', messages.patient.errors.not_found),
        }
      }

      // get Pictogram
      const pictogramResponse = await Pictogram.findOne({
        where: {
          status: true,
          id: body.pictogramId
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        }
      });
      if(!pictogramResponse) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('pictogram', messages.pictogram.errors.not_found),
        }
      }

      // validate if name exist
      const pictogramNameExist = await PatientPictogram.findOne({
        where: {
          status: true,
          name: body.name
        }
      });
      if(pictogramNameExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('name', messages.pictogram.errors.in_use.name),
        }
      }

      // TODO: ImageUrl validation has to be here

      const data = await PatientPictogram.create(
        {
          patientId: body.patientId,
          pictogramId: body.pictogramId,
          name: body.name,
          imageUrl: body.imageUrl
        },
        { transaction }
      );
      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 400,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('create', messages.pictogram.errors.service.create),
        }
      }

      // Commit Transaction
      await transaction.commit();

      const newData = await PatientPictogram.findOne({
        where: {
          id: data.id,
          status: true
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        },
        include: [
          {
            model: Pictogram,
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: {
              model: Category,
              attributes: ['id','name']
            }
          }
        ]
      });

      return {
        error: false,
        statusCode: 201,
        message: messages.pictogram.success.create,
        data: dataStructure.customPictogramDataStructure(newData),
      }


    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.pictogram.errors.service.base2}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

  async updatePatientPictogram(id,body) {
    const transaction = await sequelize.transaction();
    try {

      // Destructuring data in order to get oly the fields to modify
      const { patientId, ...resBody } = body;
      
      // get Patient
      const patientResponse = await Patient.findOne({
        where: {
          status: true,
          id: patientId
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        }
      });
      if(!patientResponse) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('patient', messages.patient.errors.not_found),
        }
      }

      // Verify if Patient has this Custom Pictogram
      const patientPictogramExist = await PatientPictogram.findOne({
        where: {
          status: true,
          patientId,
          id
        }
      });
      if(!patientPictogramExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('pictogram', messages.pictogram.errors.service.pictogram_not_match),
        }
      }

      // validate if name exist
      if(resBody.name) {
        const pictogramNameExist = await PatientPictogram.findOne({
          where: {
            status: true,
            name: resBody.name,
            patientId,
            id: {
              [Op.ne]: id
            }
          }
        });
        if(pictogramNameExist) {
          await transaction.rollback();
          return {
            error: true,
            statusCode: 409,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('name', messages.pictogram.errors.in_use.name),
          }
        }
      }

      if(resBody.imageUrl) {
        // TODO: ImageUrl validation has to be here
      }

      const data = await PatientPictogram.update(
        {
          ...resBody
        },
        {
          where: {
            id,
            patientId
          },
          transaction
        }
      );
      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('update', messages.pictogram.errors.service.update),
        }
      }

      // Commit Transaction
      await transaction.commit();

      const newData = await PatientPictogram.findOne({
        where: {
          id,
          status: true
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        },
        include: [
          {
            model: Pictogram,
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: {
              model: Category,
              attributes: ['id','name']
            }
          }
        ]
      });

      return {
        error: false,
        statusCode: 200,
        message: messages.pictogram.success.update,
        data: dataStructure.findCustomPictogramDataStructure(newData),
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.pictogram.errors.service.base2}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },


  async removePatientPictogram(id) {
    const transaction = await sequelize.transaction();
    try {
      
      const patientPictogramExist = await PatientPictogram.findOne({
        where: {
          id,
          status: true
        }
      });
      if(!patientPictogramExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.pictogram.errors.not_found,
        }
      }


      const data = await PatientPictogram.update(
        {
          status: false
        },
        {
          where: {
            id
          },
          transaction
        }
      );
      if(!data) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 400,
          message: messages.pictogram.errors.service.delete,
        }
      }

      // Commit transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.pictogram.success.delete,
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.pictogram.errors.service.base2}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  }

}