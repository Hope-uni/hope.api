const { createPersonValidation, updatePersonValidation } = require('../validations/person.validation');
const { createUserValidation, updateUserValidation } = require('../validations/user.validation');


module.exports = {

  userPersonCreateValidation(data) {

    // destructuring Object
    const {
      username,
      password,
      email,
      roles,
      firstName,
      secondName,
      surname,
      secondSurname,
      imageProfile,
      address,
      birthday,
      gender
    } = data;

    const { error:userError } = createUserValidation({
      username,
      password,
      email,
      roles
    });

    const { error:personError } = createPersonValidation({
      firstName,
      secondName,
      surname,
      secondSurname,
      imageProfile,
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
      // roles,
      firstName,
      secondName,
      surname,
      secondSurname,
      imageProfile,
      address,
      userId,
      personId,
      birthday,
      gender
    } = data;

    if(userId || username || email/*  || roles */) {
      const { error } = updateUserValidation({
        username,
        email,
        // roles
      });
      if(error)  userError = error;
    }

    if(personId || firstName || secondName || surname || secondSurname || imageProfile || address) {
      const { error } = updatePersonValidation({
        firstName,
        secondName,
        surname,
        secondSurname,
        imageProfile,
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