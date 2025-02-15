const { Pictogram } = require('@models/index');
const { Op } = require('sequelize');
const logger = require('@config/logger.config');
const { messages, formatErrorMessages } = require('@utils/index');


module.exports = {

  async validatePictogram(pictogramSentence) {

    try {

      // Validate if pictogramSentence has a valid pictograms
      const pictograms = await Pictogram.findAll({
        where: {
          id: {
            [Op.in]: pictogramSentence
          },
        },
        attributes: ['id'],
        raw: true,
      });

      // Verify is all pictogram sentences were found
      const getPictogramsIds = new Set(pictograms.map(item => item.id));


      // Check if all requested IDs exist
      const verifyAllPictograms = pictogramSentence.every(id => getPictogramsIds.has(id));

      if(pictograms.length <= 0 || !pictograms || verifyAllPictograms === false) {
        return {
          error: true,
          message: messages.pictogram.errors.service.all,
          statusCode: 404,
          validationErrors: formatErrorMessages('pictograms', messages.activity.errors.service.pictograms),
        }
      }

      return {
        error: false,
      }

    } catch (error) {
      logger.error(`${messages.activity.errors.service.base}: ${error}`);
      return {
        error: true,
        message: messages.generalMessages.server, 
        statusCode: 500
      }
    }
  },

  async getPictograms(pictogramSentence) {
    try {
      
      // get array from the string 
      const pictogramArray = pictogramSentence.split('-');

      // GetPictograms
      const pictograms = await Pictogram.findAll({
        where: {
          id: {
            [Op.in]: pictogramArray
          }
        },
        attributes: ['id', 'name', 'imageUrl'],
      });

      if(!pictograms) {
        return {
          error: true,
          message: messages.pictogram.errors.service.all,
          statusCode: 404
        }
      };

      return {
        error: false,
        message: messages.pictogram.success.all,
        pictograms,
      }


    } catch (error) {
      logger.error(`${messages.activity.errors.service.base}: ${error}`);
      return {
        error: true,
        message: messages.generalMessages.server, 
        statusCode: 500
      }
    }
  }


}