const { BlobServiceClient } = require('@azure/storage-blob');
const { v4:uuidv4 } = require('uuid');
const logger = require('../config/logger.config');
const { azureConection } = require('../config/variables.config');
const { azure:messages, generalMessages } = require('./messages.utils');

const connectionString = azureConection;


const uploadImage = async (file, containerName) => {
  try {

    // customizing the file name
    const fileName = `${uuidv4()}-${file.originalname}`;

    // Getting blod service client
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

    // get container
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Instance or prepare getting a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    // Uploading the image to the blob
    await blockBlobClient.uploadData(file.buffer, {
      blockSize: file.size
    });

    return {
      url: blockBlobClient.url
    };

  } catch (error) {
    logger.error(`${messages.errors.create}: ${error}`);
    return {
      error: true,
      statusCode: 500,
      message: messages.errors.upload
    }
  }
};

const updateAndUploadImage = async (file, blobName, containerName) => {
  try {

    // Getting blod service client
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

    // get container
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create aour custom name
    const fileName = `${uuidv4()}-${file.originalname}`;

    // Instance or prepare getting a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    // Uploading the image to the blob
    await blockBlobClient.uploadData(file.buffer, {
      blockSize: file.size,
    });

    // delete the last blob for replace with the new one.
    if(blobName != null) {
      const blobClient = containerClient.getBlobClient(decodeURI(blobName));

      await blobClient.delete();
    }

    return {
      url: blockBlobClient.url
    };

  } catch(error) {
    logger.error(`${messages.errors.update}: ${error}`);
    return {
      error: true,
      statusCode: 500,
      message: generalMessages.server,
    }
  }
}

const deleteAzureImage = async (blobName, containerName) => {
  try {

    // Getting blod service client
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

    // get container
    const containerClient = blobServiceClient.getContainerClient(containerName);


    // Delete the blob.
    const blobClient = containerClient.getBlobClient(blobName);
    const blobClientExist = await blobClient.exists();

    if(blobClientExist) {
      await blobClient.delete();
    }

    return {
      error: false
    }
  } catch(error) {
    logger.error(`${messages.errors.delete}: ${error}`);
    return {
      error: true,
      statusCode: 500,
      message: generalMessages.server
    }
  }
}

module.exports = {
  uploadImage,
  updateAndUploadImage,
  deleteAzureImage
}
