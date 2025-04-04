const { Op, Sequelize } = require('sequelize');
const { PatientPictogram, Pictogram, Category} = require('@models/index');
const logger = require('@config/logger.config');
const { messages, pagination, dataStructure } = require('@utils');

/* eslint-disable radix */
async function getCustomPictograms({categoryId, pictogramName, patientResponse}) {
  try {
    // Pictogram Variable
    let pictogramResponseWithoutFilters;

    if(!categoryId && !pictogramName) {
      pictogramResponseWithoutFilters = await Pictogram.findAll({
        where: {
          status: true,
        },
        order: [['name', 'ASC']],
        attributes: {
          exclude: ['createdAt','updatedAt','status','categoryId']
        },
        include: [
          {
            model: PatientPictogram,
            attributes: {
              exclude: ['createdAt','updatedAt']
            },
          },
          {
            model: Category,
            attributes: ['id','name']
          }
        ]
      });

      if(!pictogramResponseWithoutFilters) {
        return {
          error: false,
          message: messages.pictogram.success.all,
          statusCode: 200,
          data: [],
        }
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

      const pictogramResponse = await Pictogram.findAll({
        where: {
          status: true,
          [Op.or]: [
            {
              [Op.and]: [
                {
                  categoryId: categoryExist.id,
                  name: {
                    [Op.iLike]: `%${pictogramName}%`
                  },
                },
                {
                  id: {
                    [Op.notIn]: Sequelize.literal(
                      `(SELECT p.id FROM "Pictograms" p INNER JOIN "PatientPictograms" pp
                        on pp."pictogramId" = p.id WHERE pp.status = true AND pp."patientId" = ${patientResponse.id}
                      )`
                    )
                  },
                }
              ]
            },
            {
              id: {
                [Op.in]: Sequelize.literal(
                  `(SELECT pp."pictogramId" from "PatientPictograms" pp INNER JOIN "Pictograms" p
                    on pp."pictogramId" = p.id WHERE pp."patientId" = ${patientResponse.id}  AND pp.status = true AND p."categoryId" = ${categoryExist.id}
                    AND pp.name ILIKE '%${pictogramName}%'
                  )`
                ),
              }
            },
          ]
        },
        order: [['name', 'ASC']],
        attributes: {
          exclude: ['createdAt','updatedAt','status','categoryId']
        },
        include: [
          {
            model: PatientPictogram,
            attributes: {
              exclude: ['createdAt','updatedAt']
            },
          },
          {
            model: Category,
            where: {
              status: true,
            },
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'status']
            }
          }
        ]
      });

      // Return Data
      return {
        error: false,
        message: messages.pictogram.success.all,
        statusCode: 200,
        data: dataStructure.customPictogramDataStructureFilters(pictogramResponse, patientResponse.id),
      }
    }

    // With CategoryId
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

      const pictogramResponseByCategory = await Pictogram.findAll({
        where: {
          status: true,
          [Op.or]: [
            {
              [Op.and]: [
                {
                  categoryId: categoryExist.id
                },
                {
                  id: {
                    [Op.notIn]: Sequelize.literal(
                      `(SELECT p.id FROM "Pictograms" p INNER JOIN "PatientPictograms" pp
                        on pp."pictogramId" = p.id WHERE pp.status = true AND pp."patientId" = ${patientResponse.id}
                      )`
                    )
                  },
                }
              ]
            },
            {
              id: {
                [Op.in]: Sequelize.literal(
                  `(SELECT pp."pictogramId" from "PatientPictograms" pp INNER JOIN "Pictograms" p
                    on pp."pictogramId" = p.id WHERE pp."patientId" = ${patientResponse.id}  AND pp.status = true AND p."categoryId" = ${categoryExist.id}
                  )`
                ),
              }
            },
          ]
        },
        order: [['name', 'ASC']],
        attributes: {
          exclude: ['createdAt','updatedAt','status','categoryId']
        },
        include: [
          {
            model: PatientPictogram,
            attributes: {
              exclude: ['createdAt','updatedAt']
            },
          },
          {
            model: Category,
            where: {
              status: true,
            },
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'status']
            }
          }
        ]
      });

      // Return Data
      return {
        error: false,
        message: messages.pictogram.success.all,
        statusCode: 200,
        data: dataStructure.customPictogramDataStructureFilters(pictogramResponseByCategory, patientResponse.id),
      }
    }

    // With Pictogram's Name
    if(pictogramName && !categoryId) {

      const pictogramResponse = await Pictogram.findAll({
        where: {
          status: true,
          [Op.or]: [
            {
              [Op.and]: [
                {
                  name: {
                    [Op.iLike]: `%${pictogramName}%`
                  },
                },
                {
                  id: {
                    [Op.notIn]: Sequelize.literal(
                      `(SELECT p.id FROM "Pictograms" p INNER JOIN "PatientPictograms" pp
                        on pp."pictogramId" = p.id WHERE pp.status = true AND pp."patientId" = ${patientResponse.id}
                      )`
                    )
                  },
                }
              ]
            },
            {
              id: {
                [Op.in]: Sequelize.literal(
                  `(SELECT pp."pictogramId" from "PatientPictograms" pp INNER JOIN "Pictograms" p
                    on pp."pictogramId" = p.id WHERE pp."patientId" = ${patientResponse.id}  AND pp.status = true AND pp.name ILIKE '%${pictogramName}%'
                  )`
                ),
              }
            },
          ]
        },
        order: [['name', 'ASC']],
        attributes: {
          exclude: ['createdAt','updatedAt','status','categoryId']
        },
        include: [
          {
            model: PatientPictogram,
            attributes: {
              exclude: ['createdAt','updatedAt']
            },
          },
          {
            model: Category,
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'status']
            }
          }
        ]
      });

      // Return Data
      return {
        error: false,
        message: messages.pictogram.success.all,
        statusCode: 200,
        data: dataStructure.customPictogramDataStructureFilters(pictogramResponse, patientResponse.id),
      }
    }

    // Return Data
    return {
      error: false,
      message: messages.pictogram.success.all,
      statusCode: 200,
      data: dataStructure.customPictogramDataStructureFilters(pictogramResponseWithoutFilters, patientResponse.id),
    }
  } catch (error) {
    logger.error(`${messages.pictogram.errors.service.base2}: ${error}`);
    return {
      error: true,
      statusCode: 500,
      message: messages.generalMessages.server,
    }
  }
};


async function getPictogramsPatient(patientResponse, { categoryId, pictogramName, page, size }) {
  try {
    // Variables
    let pictogramResponse;

    // Without Pagination
    if(!page || !size || parseInt(page) === 0 && parseInt(size) === 0) {
      return await getCustomPictograms({categoryId, pictogramName, patientResponse});
    }


    const { limit, offset } = pagination.paginationValidation(page, size);


    // if categoryId and pictogramName don't exist
    if(!categoryId && !pictogramName) {
      pictogramResponse = await Pictogram.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: {
          status: true,
        },
        order: [['name', 'ASC']],
        attributes: {
          exclude: ['createdAt','updatedAt','status','categoryId']
        },
        include: [
          {
            model: PatientPictogram,
            attributes: {
              exclude: ['createdAt','updatedAt']
            },
          },
          {
            model: Category,
            attributes: ['id','name']
          }
        ]
      });
    }

    if(categoryId && pictogramName) {
      // validate if category exist
     const categoryExist = await Category.findOne({
       where: {
         id: categoryId
       }
     });
     if(!categoryExist) {
       return {
         error: true,
         message: messages.category.errors.not_found,
         statusCode: 404
       }
     }
     const pictogramResonseByCategoryId = await Pictogram.findAndCountAll({
       limit,
       offset,
       distinct: true,
       where: {
         status: true,
         [Op.or]: [
           {
             [Op.and]: [
               {
                 categoryId: categoryExist.id,
                 name: {
                   [Op.iLike]: `%${pictogramName}%`
                 },
               },
               {
                 id: {
                   [Op.notIn]: Sequelize.literal(
                     `(SELECT p.id FROM "Pictograms" p INNER JOIN "PatientPictograms" pp
                       on pp."pictogramId" = p.id WHERE pp.status = true AND pp."patientId" = ${patientResponse.id}
                     )`
                   )
                 },
               }
             ]
           },
           {
             id: {
               [Op.in]: Sequelize.literal(
                 `(SELECT pp."pictogramId" from "PatientPictograms" pp INNER JOIN "Pictograms" p
                   on pp."pictogramId" = p.id WHERE pp."patientId" = ${patientResponse.id}  AND pp.status = true AND p."categoryId" = ${categoryExist.id}
                   AND pp.name ILIKE '%${pictogramName}%'
                 )`
               ),
             }
           },
         ]
       },
       order: [['name', 'ASC']],
       attributes: {
         exclude: ['createdAt','updatedAt','status','categoryId']
       },
       include: [
         {
           model: PatientPictogram,
           attributes: {
             exclude: ['createdAt','updatedAt']
           },
         },
         {
           model: Category,
           where: {
             id: categoryExist.id,
             status: true,
           },
           attributes: {
             exclude: ['createdAt', 'updatedAt', 'status']
           }
         }
       ]
     });

     // Adding Custom pictograms and structuring
     pictogramResonseByCategoryId.rows = dataStructure.customPictogramDataStructureFilters(pictogramResonseByCategoryId.rows, patientResponse.id);

     const dataResponse = pagination.getPageData(pictogramResonseByCategoryId, page, limit);

     // Return Data
     return {
       error: false,
       message: messages.pictogram.success.all,
       statusCode: 200,
       ...dataResponse
     }
    }

    // If categoryId query param exist
    if(categoryId && !pictogramName) {
       // validate if category exist
      const categoryExist = await Category.findOne({
        where: {
          id: categoryId
        }
      });
      if(!categoryExist) {
        return {
          error: true,
          message: messages.category.errors.not_found,
          statusCode: 404
        }
      }
      const pictogramResonseByCategoryId = await Pictogram.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: {
          status: true,
          [Op.or]: [
            {
              [Op.and]: [
                {
                  categoryId: categoryExist.id
                },
                {
                  id: {
                    [Op.notIn]: Sequelize.literal(
                      `(SELECT p.id FROM "Pictograms" p INNER JOIN "PatientPictograms" pp
                        on pp."pictogramId" = p.id WHERE pp.status = true AND pp."patientId" = ${patientResponse.id}
                      )`
                    )
                  },
                }
              ]
            },
            {
              id: {
                [Op.in]: Sequelize.literal(
                  `(SELECT pp."pictogramId" from "PatientPictograms" pp INNER JOIN "Pictograms" p
                    on pp."pictogramId" = p.id WHERE pp."patientId" = ${patientResponse.id}  AND pp.status = true AND p."categoryId" = ${categoryExist.id}
                  )`
                ),
              }
            },
          ]
        },
        order: [['name', 'ASC']],
        attributes: {
          exclude: ['createdAt','updatedAt','status','categoryId']
        },
        include: [
          {
            model: PatientPictogram,
            attributes: {
              exclude: ['createdAt','updatedAt']
            },
          },
          {
            model: Category,
            where: {
              id: categoryExist.id,
              status: true,
            },
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'status']
            }
          }
        ]
      });

      // Adding Custom pictograms and structuring
      pictogramResonseByCategoryId.rows = dataStructure.customPictogramDataStructureFilters(pictogramResonseByCategoryId.rows, patientResponse.id);

      const dataResponse = pagination.getPageData(pictogramResonseByCategoryId, page, limit);

      // Return Data
      return {
        error: false,
        message: messages.pictogram.success.all,
        statusCode: 200,
        ...dataResponse
      }
    }

    // If pictogramName query param exist
    if(pictogramName && !categoryId) {

      const pictogramData = await Pictogram.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: {
          status: true,
          [Op.or]: [
            {
              [Op.and]: [
                {
                  name: {
                    [Op.iLike]: `%${pictogramName}%`
                  },
                },
                {
                  id: {
                    [Op.notIn]: Sequelize.literal(
                      `(SELECT p.id FROM "Pictograms" p INNER JOIN "PatientPictograms" pp
                        on pp."pictogramId" = p.id WHERE pp.status = true AND pp."patientId" = ${patientResponse.id}
                      )`
                    )
                  },
                }
              ]
            },
            {
              id: {
                [Op.in]: Sequelize.literal(
                  `(SELECT pp."pictogramId" from "Pictograms" p INNER JOIN "PatientPictograms" pp
                    on pp."pictogramId" = p.id WHERE pp."patientId" = ${patientResponse.id}  AND pp.status = true AND pp.name ILIKE '%${pictogramName}%'
                  )`
                ),
              }
            },
          ]
        },
        order: [['name', 'ASC']],
        attributes: {
          exclude: ['createdAt','updatedAt','status','categoryId']
        },
        include: [
          {
            model: PatientPictogram,
            attributes: {
              exclude: ['createdAt','updatedAt']
            },
          },
          {
            model: Category,
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'status']
            }
          }
        ]
      });

      // Adding Custom pictograms and structuring
      pictogramData.rows = dataStructure.customPictogramDataStructureFilters(pictogramData.rows, patientResponse.id);

      const dataResponse = pagination.getPageData(pictogramData, page, limit);

      // Return Data
      return {
        error: false,
        message: messages.pictogram.success.all,
        statusCode: 200,
        ...dataResponse
      }
    }

    // Adding Custom pictograms and structuring
    pictogramResponse.rows = dataStructure.customPictogramDataStructureFilters(pictogramResponse.rows, patientResponse.id);

    const dataResponse = pagination.getPageData(pictogramResponse, page, limit);

    return {
      error: false,
      statusCode: 200,
      message: messages.pictogram.success.all,
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
};

module.exports = {
  getCustomPictograms,
  getPictogramsPatient,
}
