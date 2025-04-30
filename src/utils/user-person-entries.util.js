const { createPersonValidation, updatePersonValidation } = require('@validations/person.validation');
const { createUserValidation, updateUserValidation } = require('@validations/user.validation');


module.exports = {

  userPersonCreateValidation(data) {

    // destructuring Object
    const {
      username,
      email,
      firstName,
      secondName,
      surname,
      secondSurname,
      imageUrl,
      address,
      birthday,
      gender
    } = data;

    const { error:userError } = createUserValidation({
      username,
      email,
      imageUrl,
    });

    const { error:personError } = createPersonValidation({
      firstName,
      secondName,
      surname,
      secondSurname,
      address,
      birthday,
      gender
    });

    if(userError || personError) {
      const getUserError = userError ? userError.details : [];
      const getPersonError = personError ? personError.details : [];

      const joinError = {
        details: [
          ...getUserError,
          ...getPersonError
        ]
      }

      return {
        error: joinError
      }
    };

    return {
      error: false
    };
  },

  userPersonUpdateValidation(data) {

    // Variables
    let userError;
    let personError;

    // destructuring Object
    const {
      username,
      email,
      firstName,
      secondName,
      surname,
      secondSurname,
      imageUrl,
      address,
      userId,
      personId,
      birthday,
      gender
    } = data;

    if(userId || username || email || imageUrl) {
      const { error } = updateUserValidation({
        username,
        email,
        imageUrl,
      });
      if(error)  userError = error;
    }

    if(personId || firstName || secondName || surname || secondSurname || address || birthday || gender) {
      const { error } = updatePersonValidation({
        firstName,
        secondName,
        surname,
        secondSurname,
        address,
        birthday,
        gender
      });
      if(error) personError = error;
    }

    if(userError || personError) {
      const getUserError = userError ? userError.details : [];
      const getPersonError = personError ? personError.details : [];

      const joinError = {
        details: [
          ...getUserError,
          ...getPersonError
        ]
      }

      return {
        error: joinError
      }
    };

    return {
      error: false
    };
  }

}
