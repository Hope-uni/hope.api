const { Op } = require('sequelize');
const { PatientPictogram, Patient, Pictogram, Category, User, Role, UserRoles } = require('@models/index');
const logger = require('@config/logger.config');
const { messages, pagination, dataStructure } = require('@utils/index');

/* eslint-disable radix */
async function getCustomPictograms({categoryId, pictogramName, patientResponse}) {
  try {
    // Pictogram Variable
    let pictogramData;
    const customPatientPictograms = [];

    if(!categoryId && !pictogramName) {
      pictogramData = await Pictogram.findAll({
        where: {
          status: true,
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','categoryId']
        },
        include: [
          {
            model: Category,
            attributes: ['id','name']
          }
        ]
      });
    }

    // With CategoryId
    /* The above JavaScript code is checking if a category with a specific ID exists. If the
    category exists, it then retrieves pictogram data associated with that category. */
    if(categoryId) {
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

      pictogramData = await Pictogram.findAll({
        where: {
          status: true,
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','categoryId']
        },
        include: [
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
    }

    // With Pictogram's Name
    /* The above JavaScript code is performing a search for pictogram data based on a given
    `pictogramName`. It first tries to find the pictogram data in the `Pictogram` model where
    the `name` column matches the provided `pictogramName` using a case-insensitive like
    comparison. If no results are found in the `Pictogram` model, it then searches for the
    pictogram data in the `PatientPictogram` model using the same criteria. */
    if(pictogramName) {
      pictogramData = await Pictogram.findAll({
        where: {
          status: true,
          name: {
            [Op.like]: `%${pictogramName}%`
          }
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','categoryId']
        },
        include: [
          {
            model: Category,
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'status']
            }
          }
        ]
      });
      if(Object.keys(pictogramData).length === 0) {
        pictogramData = await PatientPictogram.findAll({
          where: {
            status: true,
            name: {
              [Op.like]: `%${pictogramName}%`
            }
          },
          attributes: {
            exclude: ['createdAt','updatedAt','status']
          },
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
      }
    }


    /* eslint-disable no-restricted-syntax */
    /* eslint-disable no-await-in-loop */
    for (const pictogram of pictogramData) {

      const patientPictogramResponse = await PatientPictogram.findOne({
        where: {
          status: true,
          patientId: patientResponse.id,
          pictogramId: pictogram.id,
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


      /* The code is checking if a `categoryId` exists. If it does, it then checks if
      `patientPictogramResponse` is falsy and if the `pictogram.Category.id` matches the
      `categoryId`. If the conditions are met, the `pictogram` is pushed to the
      `customPatientPictograms` array. */
      if(categoryId) {
        if(!patientPictogramResponse && parseInt(pictogram.Category.id) === parseInt(categoryId)) {
          customPatientPictograms.push(pictogram);
        }

        if(patientPictogramResponse && parseInt(pictogram.Category.id) === parseInt(categoryId)) {
          customPatientPictograms.push(patientPictogramResponse);
        }
      }

      /* The code snippet provided is written in JavaScript. It checks if the variable
      `pictogramName` is truthy. If `pictogramName` is truthy, it then checks if
      `patientPictogramResponse` is falsy. If `patientPictogramResponse` is falsy, it pushes the
      value of `pictogram` into the `customPatientPictograms` array. */
      if(pictogramName) {
        if(!patientPictogramResponse) {
          customPatientPictograms.push(pictogram);
        }

        if(patientPictogramResponse) {
          customPatientPictograms.push(patientPictogramResponse);
        }
      }

      /* The code snippet provided is written in JavaScript. It checks if the variables
      `categoryId` and `pictogramName` are falsy (undefined, null, 0, false, empty string,
      etc.). If both `categoryId` and `pictogramName` are falsy, it then checks if the variable
      `patientPictogramResponse` is falsy. If `patientPictogramResponse` is falsy, it pushes the
      value of `pictogram` into the `customPatientPictograms` array. If
      `patientPictogramResponse` is truthy, */
      if(!categoryId && !pictogramName) {
        if(!patientPictogramResponse) {
          customPatientPictograms.push(pictogram);
        }

        if(patientPictogramResponse) {
          customPatientPictograms.push(patientPictogramResponse);
        }
      }
    }

    // Return Data
    return {
      error: false,
      message: messages.pictogram.success.all,
      statusCode: 200,
      data: dataStructure.customPictogramDataStructure(customPatientPictograms),
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


async function getPictogramsPatient(payload, { patientId, categoryId, pictogramName, page, size }) {
  try {
    // Variables
    let patientResponse;
    const customPatientPictograms = [];

    /*
      If user is superAdmin or admin this means UserRoles will be undefined, because [Op.notIn]: [1,2] does not
      allow search roles with id 1 and id 2.
    */
    const userType = await User.findOne({
      where: {
        id: payload.id,
        status: true,
      },
      include: [
        {
          model: UserRoles,
          include: [
            {
              model: Role,
              where: {
                id: {
                  [Op.notIn]: [1,2]
                }
              }
            }
          ]
        }
      ]
    });

    // if there is UserRoles This means the user who is trying to get the data is the Patient;
    if(userType.UserRoles[0]) {
      // get Patient
      patientResponse = await Patient.findOne({
        where: {
          status: true,
          userId: payload.id
        },
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
    };

    // If there is not UserRoles This means the user who is trying to get the data is Superadmin or Admin.
    if(!userType.UserRoles[0]) {
      if(!patientId) {
        return {
          error: true,
          message: messages.patient.fields.id.required,
          statusCode: 400,
        }
      }
      // get Patient
      patientResponse = await Patient.findOne({
        where: {
          status: true,
          id: patientId
        },
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
    }

    // Without Pagination
    if(!page || !size || parseInt(page) === 0 && parseInt(size) === 0) {

      // const { getCustomPictograms } = this;
      return await getCustomPictograms({categoryId, pictogramName, patientResponse});


    }

    // Pictograms with Pagination
    let pictogramResponse;

    const { limit, offset } = pagination.paginationValidation(page, size);


    /* The above JavaScript code is checking if both `categoryId` and `pictogramName` are falsy
    values. If they are both falsy, it then executes a database query using Sequelize to find and
    count all Pictograms that meet the specified criteria. The query includes a limit and offset
    for pagination, filters by `status: true`, excludes certain attributes from the result, and
    includes the Category model with specific attributes. */
    if(!categoryId && !pictogramName) {
      pictogramResponse = await Pictogram.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: {
          status: true,
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','categoryId']
        },
        include: [
          {
            model: Category,
            attributes: ['id','name']
          }
        ]
      });
    }

    /* The above code is checking if a category with a specific ID exists. If the category exists, it
    then retrieves pictograms that belong to that category. If the category does not exist, it
    returns an error message with a status code of 404. */
    if(categoryId) {
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
      pictogramResponse = await Pictogram.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: {
          status: true,
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','categoryId']
        },
        include: [
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
    }

    if(pictogramName) {
      pictogramResponse = await Pictogram.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: {
          status: true,
          name: {
            [Op.like]: `%${pictogramName}%`
          }
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','categoryId']
        },
        include: [
          {
            model: Category,
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'status']
            }
          }
        ]
      });
      if(Object.keys(pictogramResponse).length === 0) {
        pictogramResponse = await PatientPictogram.findAndCountAll({
          limit,
          offset,
          distinct: true,
          where: {
            status: true,
            name: {
              [Op.like]: `%${pictogramName}%`
            }
          },
          attributes: {
            exclude: ['createdAt','updatedAt','status']
          },
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
      }
    }

    // Filter for custom pictograms
    for (const pictogram of pictogramResponse.rows) {

      const patientPictogramResponse = await PatientPictogram.findOne({
        where: {
          status: true,
          patientId: patientResponse.id,
          pictogramId: pictogram.id,
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

      /* The code is checking if a `categoryId` exists. If it does, it then checks if
      `patientPictogramResponse` is falsy and if the `pictogram.Category.id` is equal to the
      `categoryId`. If both conditions are met, the `pictogram` is pushed into the
      `customPatientPictograms` array. */
      if(categoryId) {
        if(!patientPictogramResponse && parseInt(pictogram.Category.id) === parseInt(categoryId)) {
          customPatientPictograms.push(pictogram);
        }

        if(patientPictogramResponse && parseInt(pictogram.Category.id) === parseInt(categoryId)) {
          customPatientPictograms.push(patientPictogramResponse);
        }
      }

      /* The code is checking if a `pictogramName` is truthy. If it is, it then checks if
      `patientPictogramResponse` is falsy. If `patientPictogramResponse` is falsy, it pushes
      `pictogram` into the `customPatientPictograms` array. If `patientPictogramResponse` is
      truthy, it pushes `patientPictogramResponse` into the `customPatientPictograms` array. */
      if(pictogramName) {
        if(!patientPictogramResponse) {
          customPatientPictograms.push(pictogram);
        }

        if(patientPictogramResponse) {
          customPatientPictograms.push(patientPictogramResponse);
        }
      }

      /* The above JavaScript code is checking if the variables `categoryId` and `pictogramName` are
      falsy (undefined, null, 0, false, empty string, NaN). If both are falsy, it then checks if
      the variable `patientPictogramResponse` is falsy. If `patientPictogramResponse` is falsy, it
      pushes the `pictogram` variable into the `customPatientPictograms` array. If
      `patientPictogramResponse` is truthy, it pushes the `patientPictogramResponse` variable into
      the `customPatient */
      if(!categoryId && !pictogramName) {
        if(!patientPictogramResponse) {
          customPatientPictograms.push(pictogram);
        }

        if(patientPictogramResponse) {
          customPatientPictograms.push(patientPictogramResponse);
        }
      }


    }

    // Adding Custom pictograms and structuring
    pictogramResponse.rows = dataStructure.customPictogramDataStructure(customPatientPictograms);

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


async function getPictogramsPatientTutor({ patientId, categoryId, pictogramName, page, size }, tutor) {
  try {

    if(!patientId) {
      return {
        error: true,
        message: messages.patient.errors.not_found,
        statusCode: 404
      }
    }

    // get Patient
    const patientResponse = await Patient.findOne({
      where: {
        id: patientId,
        status: true,
        tutorId: tutor.id,
      },
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

    // Variables
    const customPatientPictograms = [];

    // Without Pagination
    if(!page || !size || parseInt(page) === 0 && parseInt(size) === 0) {

      return await getCustomPictograms({categoryId, pictogramName, patientResponse});

    }

    // Pictograms with Pagination
    let pictogramResponse;

    const { limit, offset } = pagination.paginationValidation(page, size);

    // Without categoryId and pictogramName
    if(!categoryId && !pictogramName ) {
      pictogramResponse = await Pictogram.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: {
          status: true,
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','categoryId']
        },
        include: [
          {
            model: Category,
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'status']
            }
          }
        ]
      });
    }

    // With categoryId
    /* The above JavaScript code is checking if a category with a specific ID exists in the database.
    If the category does not exist, it returns an error response with a message indicating that
    the category was not found. If the category exists, it then retrieves a list of pictograms
    associated with that category. The code uses Sequelize ORM to query the database for the
    category and pictograms based on certain criteria such as status and attributes to include or
    exclude. */
    if(categoryId) {
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
      pictogramResponse = await Pictogram.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: {
          status: true,
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','categoryId']
        },
        include: [
          {
            model: Category,
            where: {
              id: categoryId,
              status: true,
            },
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'status']
            }
          }
        ]
      });
    }

    // With pictogramName
    if(pictogramName){
      pictogramResponse = await Pictogram.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: {
          status: true,
          name: {
            [Op.like]: `%${pictogramName}%`
          }
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','categoryId']
        },
        include: [
          {
            model: Category,
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'status']
            }
          }
        ]
      });
      if(Object.keys(pictogramResponse).length === 0) {
        pictogramResponse = await PatientPictogram.findAndCountAll({
          limit,
          offset,
          distinct: true,
          where: {
            status: true,
            name: {
              [Op.like]: `%${pictogramName}%`
            }
          },
          attributes: {
            exclude: ['createdAt','updatedAt','status']
          },
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
      }
    }

    // Filter for custom pictograms
    for (const pictogram of pictogramResponse.rows) {

      const patientPictogramResponse = await PatientPictogram.findOne({
        where: {
          status: true,
          patientId: patientResponse.id,
          pictogramId: pictogram.id,
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


      /* The code is checking if a `categoryId` exists. If it does, it then checks if
      `patientPictogramResponse` is falsy and if the `pictogram.Category.id` is equal to the
      `categoryId`. If both conditions are met, the `pictogram` is pushed into the
      `customPatientPictograms` array. */
      if(categoryId) {
        if(!patientPictogramResponse && parseInt(pictogram.Category.id) === parseInt(categoryId)) {
          customPatientPictograms.push(pictogram);
        }

        if(patientPictogramResponse && parseInt(pictogram.Category.id) === parseInt(categoryId)) {
          customPatientPictograms.push(patientPictogramResponse);
        }
      }

      /* The code is checking if a `pictogramName` is truthy. If it is, it then checks if
      `patientPictogramResponse` is falsy. If `patientPictogramResponse` is falsy, it pushes
      `pictogram` into the `customPatientPictograms` array. If `patientPictogramResponse` is
      truthy, it pushes `patientPictogramResponse` into the `customPatientPictograms` array. */
      if(pictogramName) {
        if(!patientPictogramResponse) {
          customPatientPictograms.push(pictogram);
        }

        if(patientPictogramResponse) {
          customPatientPictograms.push(patientPictogramResponse);
        }
      }

      /* The above JavaScript code is checking if the variables `categoryId` and `pictogramName` are
      falsy (undefined, null, 0, false, empty string, NaN). If both are falsy, it then checks if
      the variable `patientPictogramResponse` is falsy. If `patientPictogramResponse` is falsy, it
      pushes the `pictogram` variable into the `customPatientPictograms` array. If
      `patientPictogramResponse` is truthy, it pushes the `patientPictogramResponse` variable into
      the `customPatient */
      if(!categoryId && !pictogramName) {
        if(!patientPictogramResponse) {
          customPatientPictograms.push(pictogram);
        }

        if(patientPictogramResponse) {
          customPatientPictograms.push(patientPictogramResponse);
        }
      }
    }

    // Adding Custom pictograms and Structuring
    pictogramResponse.rows = dataStructure.customPictogramDataStructure(customPatientPictograms);

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
  getPictogramsPatientTutor
}
