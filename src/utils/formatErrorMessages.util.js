

const formatJoiMessages = (error) => {

  // variables
  const newFormat = [];

  const { details } = error;

  details.forEach((item) => {
    const { message, path } = item;

    // create a object to make the correct data
    const obj = {};
    obj[path[0]] = message;

    newFormat.push(obj);
  });

  return newFormat;
};


const formatErrorMessages = (keyName, message) => {

  const newFormat = {};
  newFormat[keyName] = message;

  return newFormat;
};


module.exports = {
  formatJoiMessages,
  formatErrorMessages
}