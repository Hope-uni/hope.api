const { Op } = require('sequelize');
const { PatientPictogram, Patient, Pictogram, Category, TutorTherapist, User, sequelize } = require('@models/index');
const logger = require('@config/logger.config');
const { messages, dataStructure, formatErrorMessages, pagination } = require('@utils/index');
const { getPictogramsPatient, getPictogramsPatientTutor } = require('@helpers/index');
const constants = require('@constants/role.constant');


module.exports = {

  async allCustomPictograms({ patientId, page, size }, payload) {
    try {

      // Variables
      let patientResponse; // this variabe will get all the patient data for the different validations

      // Validate if patient id was provided
      if(!patientId || patientId === null || patientId.trim() === "") {
        return {
          error: true,
          message: messages.patient.fields.id.required,
          statusCode: 400,
        }
      }

      // get Patient
      patientResponse = await Patient.findOne({
        where: {
          id: patientId,
          status: true,
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        },
        include: [
          {
            model: User,
            where: {
              status: true,
            }
          }
        ]
      });

      // Get Tutor
      if(payload.roles.includes(constants.TUTOR_ROLE)) {
        const tutorExist = await TutorTherapist.findOne({
          where: {
            userId: payload.id
          },
        });
        if(!tutorExist) {
          return {
            error: true,
            message: messages.tutor.errors.not_found,
            statusCode: 404
          }
        }

        // get Patient
        patientResponse = await Patient.findOne({
          where: {
            id: patientId,
            status: true,
            tutorId: tutorExist.id,
          },
          attributes: {
            exclude: ['createdAt','updatedAt','status']
          },
          include: [
            {
              model: User,
              where: {
                status: true,
              }
            }
          ]
        });
      }

      
      if(!patientResponse) {
        return {
          error: true,
          statusCode: 404,
          message: messages.patient.errors.not_found,
        }
      }

     // Without Pagination
     /* eslint-disable radix */
      if(!page || !size || parseInt(page) === 0 && parseInt(size) === 0) {

        const data = await PatientPictogram.findAll({
          where: {
            status: true,
            patientId,
          },
          attributes: ['id', 'name', 'imageUrl'],
          include: [
            {
              model: Pictogram,
              attributes: {
                exclude: ['createdAt','updatedAt','status','categoryId']
              },
              include: {
                model: Category,
                attributes: {
                  exclude: ['createdAt','updatedAt','status']
                }
              }
            }
          ]
        });
        if(!data) {
          return {
            error: false,
            statusCode: 200,
            message: messages.pictogram.errors.service.all,
          }
        }
  
        return {
          error: false,
          statusCode: 200,
          message: messages.pictogram.success.all,
          data: dataStructure.patientPictogramDataStructure(data),
        }
      }

      // With Pagination
      const { limit, offset } = pagination.paginationValidation(page, size);

      const data = await PatientPictogram.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: {
          status: true,
          patientId,
        },
        attributes: ['id', 'name', 'imageUrl'],
        include: [
          {
            model: Pictogram,
            attributes: {
              exclude: ['createdAt','updatedAt','status','categoryId']
            },
            include: {
              model: Category,
              attributes: {
                exclude: ['createdAt','updatedAt','status']
              }
            }
          },
        ]
      });

      // Structuring the data form the request
      data.rows = dataStructure.patientPictogramDataStructure(data.rows);

      const dataResponse = pagination.getPageData(data, page, limit);

      return {
        error: false,
        statusCode: 200,
        message: messages.pictogram.success.all_patient_pictograms,
        ...dataResponse
      }

    } catch (error) {
      logger.error(`${messages.pictogram.errors.service.base2}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

  async all(query, payload) {
    try {

      if(payload.roles.includes(constants.TUTOR_ROLE)) {

        // Get Tutor
        const tutorExist = await TutorTherapist.findOne({
          where: {
            userId: payload.id
          },
        });
        if(!tutorExist) {
          return {
            error: true,
            message: messages.tutor.errors.not_found,
            statusCode: 404
          }
        }

        return await getPictogramsPatientTutor(query, tutorExist);
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

      // validate if the pictogram already has a Custom Pictogram associated
      const pictogramExist = await PatientPictogram.findOne({
        where: {
          status: true,
          pictogramId: body.pictogramId,
          patientId: body.patientId,
        },
      });

      if(pictogramExist) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.pictogram.errors.service.pictogram_used,
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
        data: dataStructure.findCustomPictogramDataStructure(newData),
      }


    } catch (error) {
      // await transaction.rollback();
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