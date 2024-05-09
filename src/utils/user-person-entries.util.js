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
    if(userError) {
      return {
        error: userError.details[0].message
      }
    };

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
    if(personError) {
      return {
        error: personError.details[0].message
      }
    };

    return {
      error: false
    };
  },

  userPersonUpdateValidation(data) {
    // destructuring Object
    const {
      username,
      email,
      roles,
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

    if(userId || username || email || roles) {
      const { error:userError } = updateUserValidation({
        username,
        email,
        roles
      });
      if(userError) {
        return {
          error: userError.details[0].message
        }
      };
    }

    if(personId || firstName || secondName || surname || secondSurname || imageProfile || address) {
      const { error:personError } = updatePersonValidation({
        firstName,
        secondName,
        surname,
        secondSurname,
        imageProfile,
        address,
        birthday,
        gender
      });
      if(personError) {
        return {
          error: personError.details[0].message
        }
      };
    }

    return {
      error: false
    };
  }

}