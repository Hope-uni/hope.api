const { createPersonValidation, updatePersonValidation } = require('../validations/person.validation');
const { createUserValidation, updateUserValidation } = require('../validations/user.validation');


module.exports = {

  userPersonCreateValidation(data) {

    // destructuring Object
    const {
      username,
      password,
      email,
      roleId,
      firstName,
      secondName,
      surname,
      secondSurname,
      imageProfile,
      address,
    } = data;

    const { error:userError } = createUserValidation({
      username,
      password,
      email,
      roleId
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
      address
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
      roleId,
      firstName,
      secondName,
      surname,
      secondSurname,
      imageProfile,
      address,
      idUser,
      idPerson
    } = data;

    if(idUser || username || email || roleId) {
      const { error:userError } = updateUserValidation({
        id:idUser,
        username,
        email,
        roleId
      });
      if(userError) {
        return {
          error: userError.details[0].message
        }
      };
    }

    if(idPerson || firstName || secondName || surname || secondSurname || imageProfile || address) {
      const { error:personError } = updatePersonValidation({
        id:idPerson,
        firstName,
        secondName,
        surname,
        secondSurname,
        imageProfile,
        address
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