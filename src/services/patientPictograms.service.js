const { Op, Sequelize } = require('sequelize');
const { PatientPictogram, Patient, Pictogram, Category, TutorTherapist, User, UserRoles, sequelize } = require('@models');
const logger = require('@config/logger.config');
const { getPictogramsPatient } = require('@helpers');
const { roleConstants: constants } = require('@constants');
const { pictogramContainer, defaultPictogramImage } = require('../config/variables.config');
const {
  messages,
  dataStructure,
  formatErrorMessages,
  pagination,
 azureImages
} = require('../utils');


module.exports = {

  async allCustomPictograms({ patientId, page, size, categoryId, pictogramName }, payload) {
    try {

      // Variables
      let patientWhereCondition = {
        id: patientId,
        status: true,
      }
      let pictogramWhereCondition = {
        status: true,
        patientId,
      }


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
            statusCode: 404,
            message: messages.tutor.errors.not_found
          }
        }

        // udpate patientWhereCondition
        patientWhereCondition = {
          ...patientWhereCondition,
          tutorId: tutorExist.id
        }
      }

      // get Patient
      const patientResponse = await Patient.findOne({
        where: patientWhereCondition,
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

      if(!patientResponse) {
        return {
          error: true,
          statusCode: 404,
          message: messages.patient.errors.not_found,
        }
      }

      if(pictogramName && !categoryId) {
        pictogramWhereCondition = {
          ...pictogramWhereCondition,
          name: {
            [Op.iLike]: `%${pictogramName}%`
          }
        }
      }


     // Without Pagination
     /* eslint-disable radix */
      if(!page || !size || parseInt(page) === 0 && parseInt(size) === 0) {

        // If categoryId parameter was sent
        if(categoryId && !pictogramName) {
          // validate if category exist
          const categoryExist = await Category.findOne({
            where: {
              id: categoryId,
              status: true
            }
          });
          if(!categoryExist) {
            return {
              error: true,
              message: messages.category.errors.not_found,
              statusCode: 404
            }
          }

          const dataResponseByCategoryId = await PatientPictogram.findAll({
            where: {
              status: true,
              patientId,
            },
            order: [['name', 'ASC']],
            attributes: ['id', 'name', 'imageUrl'],
            include: [
              {
                model: Pictogram,
                where: {
                  categoryId: categoryExist.id
                },
                attributes: {
                  exclude: ['createdAt','updatedAt','status','categoryId']
                },
                include: {
                  model: Category,
                  where: {
                    status: true,
                  },
                  attributes: {
                    exclude: ['createdAt','updatedAt','status']
                  }
                }
              }
            ]
          });

          return {
            error: false,
            statusCode: 200,
            message: messages.pictogram.success.all,
            data: dataResponseByCategoryId.length > 0 ?  dataStructure.customPictogramDataStructure(dataResponseByCategoryId) : [],
          }
        }

        // If categoryId and PictogramName parameters were sent
        if(categoryId && pictogramName) {
          // validate if category exist
          const categoryExist = await Category.findOne({
            where: {
              id: categoryId,
              status: true
            }
          });
          if(!categoryExist) {
            return {
              error: true,
              message: messages.category.errors.not_found,
              statusCode: 404
            }
          }

          const dataResponse = await PatientPictogram.findAll({
            where: {
              status: true,
              id: {
                [Op.in]: Sequelize.literal(`(SELECT pp.id FROM "PatientPictograms" pp INNER JOIN "Pictograms" p
                  on pp."pictogramId" = p.id WHERE pp.name ILIKE '%${pictogramName}%' AND p."categoryId" = ${categoryExist.id} AND pp."patientId" = ${patientId} AND p.status = true)`
                )
              },
            },
            order: [['name', 'ASC']],
            attributes: ['id', 'name', 'imageUrl'],
            include: [
              {
                model: Pictogram,
                attributes: {
                  exclude: ['createdAt','updatedAt','status','categoryId']
                },
                include: {
                  model: Category,
                  where: {
                    status: true,
                  },
                  attributes: {
                    exclude: ['createdAt','updatedAt','status']
                  }
                }
              }
            ]
          });

          return {
            error: false,
            statusCode: 200,
            message: messages.pictogram.success.all,
            data: dataResponse.length > 0 ?  dataStructure.customPictogramDataStructure(dataResponse) : [],
          }
        }

        const data = await PatientPictogram.findAll({
          where: pictogramWhereCondition,
          order: [['name', 'ASC']],
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

        return {
          error: false,
          statusCode: 200,
          message: messages.pictogram.success.all,
          data: data.length > 0 ?  dataStructure.customPictogramDataStructure(data) : [],
        }
      }

      // With Pagination
      const { limit, offset } = pagination.paginationValidation(page, size);

      // CategoryId was sent paginatin version
      if(categoryId && !pictogramName) {

        // validate if category exist
        const categoryExist = await Category.findOne({
          where: {
            id: categoryId,
            status: true
          }
        });
        if(!categoryExist) {
          return {
            error: true,
            message: messages.category.errors.not_found,
            statusCode: 404
          }
        }

        const dataResponseByCategoryId = await PatientPictogram.findAndCountAll({
          limit,
          offset,
          distinct: true,
          order: [['name', 'ASC']],
          where: {
            status: true,
            patientId,
          },
          attributes: ['id', 'name', 'imageUrl'],
          include: [
            {
              model: Pictogram,
              where: {
                categoryId: categoryExist.id,
                status: true,
              },
              attributes: {
                exclude: ['createdAt','updatedAt','status','categoryId']
              },
              include: {
                model: Category,
                where: {
                  status: true,
                },
                attributes: {
                  exclude: ['createdAt','updatedAt','status']
                }
              }
            },
          ]
        });

        // Structuring the data form the request
        dataResponseByCategoryId.rows = dataStructure.customPictogramDataStructure(dataResponseByCategoryId.rows);

        const dataResponse = pagination.getPageData(dataResponseByCategoryId, page, limit);

        return {
          error: false,
          statusCode: 200,
          message: messages.pictogram.success.all_patient_pictograms,
          ...dataResponse
        }
      }

      if(categoryId && pictogramName) {

        // validate if category exist
        const categoryExist = await Category.findOne({
          where: {
            id: categoryId,
            status: true
          }
        });
        if(!categoryExist) {
          return {
            error: true,
            message: messages.category.errors.not_found,
            statusCode: 404
          }
        }

        const dtaResponseByFilters = await PatientPictogram.findAndCountAll({
          limit,
          offset,
          distinct: true,
          order: [['name', 'ASC']],
          where: {
            status: true,
            id: {
              [Op.in]: Sequelize.literal(`(SELECT pp.id FROM "PatientPictograms" pp INNER JOIN "Pictograms" p
                on pp."pictogramId" = p.id WHERE pp.name ILIKE '%${pictogramName}%' AND p."categoryId" = ${categoryExist.id} AND pp."patientId" = ${patientId} AND p.status = true)`
              )
            },
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
                where: {
                  status: true,
                },
                attributes: {
                  exclude: ['createdAt','updatedAt','status']
                }
              }
            },
          ]
        });

        // Structuring the data form the request
        dtaResponseByFilters.rows = dataStructure.customPictogramDataStructure(dtaResponseByFilters.rows);

        const dataResponse = pagination.getPageData(dtaResponseByFilters, page, limit);

        return {
          error: false,
          statusCode: 200,
          message: messages.pictogram.success.all_patient_pictograms,
          ...dataResponse
        }
      }

      const data = await PatientPictogram.findAndCountAll({
        limit,
        offset,
        distinct: true,
        order: [['name', 'ASC']],
        where: pictogramWhereCondition,
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
      data.rows = dataStructure.customPictogramDataStructure(data.rows);

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


      // get Patient
      const patientResponse = await Patient.findOne({
        where: {
          status: true,
        },
        include: [
          {
            model: User,
            where: {
              id: payload.id,
              status: true,
              userVerified: true
            }
          }
        ],
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        }
      });
      if(!patientResponse) {
        return {
          error: true,
          statusCode: 404,
          message: messages.patient.errors.not_found,
        }
      }

      return await getPictogramsPatient(patientResponse,query);
    } catch (error) {
      logger.error(`${messages.pictogram.errors.service.base2}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

  async createPatientPictogram(body, file) {
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
      if(file) {
        const { error, statusCode, message, url } = await azureImages.uploadImage(file, pictogramContainer);

        if(error) {
          await transaction.rollback();
          return {
            error,
            statusCode,
            message: messages.generalMessages.base,
            validationErrors: formatErrorMessages('upload', message),
          }
        }

        body.imageUrl = url;
      } else {
        body.imageUrl = defaultPictogramImage;
      }

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
              attributes: {
                exclude: ['createdAt','updatedAt','status']
              },
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

  async updatePatientPictogram(id,body, payload, file) {
    const transaction = await sequelize.transaction();
    try {

      // Destructuring data in order to get oly the fields to modify
      const { patientId, ...resBody } = body;

      // variables
      let whereCondition = { // this is the where condition when the admin is trying to update a custom pictogram.
        id: patientId,
        status: true,
      };

      if(payload.roles.includes(constants.TUTOR_ROLE)) {
        const tutorExist = await TutorTherapist.findOne({
          where: {
            userId: payload.id,
            status: true,
          },
          include: [
            {
              model: User,
              where:
               {
                 status: true,
               }
            }
          ]
        });

        if(!tutorExist) {
          return {
            error: true,
            statusCode: 404,
            message: messages.tutor.errors.not_found
          }
        }

        // add tutoId condition, in order to get only the patients that have a relation with the current tutor logged.
        whereCondition = {
          ...whereCondition,
          tutorId: tutorExist.id
        }
      }

      // get Patient
      const patientResponse = await Patient.findOne({
        where: whereCondition,
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

      // Verify if pictogram exist
      const pictogramExist = await Pictogram.findByPk(id);

      if(!pictogramExist) {
        await transaction.rollback();
        return  {
          error: true,
          statusCode: 409,
          message: messages.pictogram.errors.not_found
        }
      }

      // Verify if Patient has this Custom Pictogram
      const patientPictogramExist = await PatientPictogram.findOne({
        where: {
          patientId,
          pictogramId: id,
          status: true,
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
            pictogramId: {
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

      if(file) {
        const imageName = patientPictogramExist.imageUrl.split('/').pop();
        let handleError;

        if(patientPictogramExist.imageUrl === defaultPictogramImage) {
          const { url, ...restResponse}  = await azureImages.updateAndUploadImage(file, null, pictogramContainer);
          handleError = restResponse;

          resBody.imageUrl = url;
        }

        if(patientPictogramExist.imageUrl !== defaultPictogramImage) {
          const { url, ...restResponse}  = await azureImages.updateAndUploadImage(file, imageName, pictogramContainer);
          handleError = restResponse;

          resBody.imageUrl = url;
        }

        if(handleError.error) {
          await transaction.rollback();
          return {
            error: handleError.error,
            statusCode: handleError.statusCode,
            message: messages.generalMessages.server,
            validationErrors: formatErrorMessages('upload', handleError.message),
          }
        }
      }

      const data = await PatientPictogram.update(
        {
          ...resBody
        },
        {
          where: {
            patientId,
            pictogramId: id,
            status: true,
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
          patientId,
          pictogramId:id,
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
              attributes: {
                exclude: ['createdAt','updatedAt','status']
              },
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


  async removePatientPictogram({ id, patientId }, payload) {
    const transaction = await sequelize.transaction();
    try {

      // variables
      let whereCondition = {
        id: patientId,
        status: true,
      }

      // Check if the user logged is a tutor
      if(payload.roles.includes(constants.TUTOR_ROLE)) {
        const tutorResponse = await TutorTherapist.findOne({
          where: {
            userId: payload.id
          },
          include: [
            {
              model: User,
              include: [
                {
                  model: UserRoles,
                  where: {
                    roleId: 5
                  }
                }
              ]
            }
          ]
        });

        if(!tutorResponse) {
          return {
            error: true,
            statusCode: 404,
            message: messages.tutor.errors.not_found
          }
        }

        whereCondition = {
          ...whereCondition,
          tutorId: tutorResponse.id
        }
      }

      // validate if patient exist
      const patientExist = await Patient.findOne({
        where: whereCondition,
      });

      if(!patientExist) {
        return {
          error: true,
          statusCode: 404,
          message: messages.patient.errors.not_found
        }
      }

      // Verify if pictogram exist
      const pictogramExist = await Pictogram.findByPk(id);

      if(!pictogramExist) {
        await transaction.rollback();
        return  {
          error: true,
          statusCode: 409,
          message: messages.pictogram.errors.not_found
        }
      }

      const patientPictogramExist = await PatientPictogram.findOne({
        where: {
          patientId,
          pictogramId: id,
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
            id: patientPictogramExist.id,
            patientId,
            pictogramId: id,
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

      // Delete patientPictogram image in the azure container
      if(patientPictogramExist.imageUrl !== defaultPictogramImage) {
        const imageName = patientPictogramExist.imageUrl.split('/').pop();
        const { error, statusCode, message } = await azureImages.deleteAzureImage(imageName, pictogramContainer);

        if(error) {
          await transaction.rollback();
          return {
            error,
            statusCode,
            message
          }
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
