const dates = require('./dates.util');

/* eslint-disable no-restricted-syntax */
module.exports = {


  // Users 

  /* The `userDataStructure(data)` function is creating a new data structure for users by iterating
  over the input `data` array. It extracts specific information from each user object in the array
  and organizes it into a new structure. Here's a breakdown of what it does: */
  userDataStructure(data) {

    const newData = [];
    
    for (const iterator of data) {
      const rolesData = [];

      for (const role of iterator.UserRoles) {
        rolesData.push(role.Role);
      }
      const element = {
        id: iterator.id,
        username: iterator.username,
        email: iterator.email,
        Roles: rolesData
      }
      newData.push(element);
    }

    return newData;
  },

  findUserDataStructure(data) {

    const rolesData = [];
    for (const role of data.UserRoles) {
      rolesData.push(role.Role);
    }

    const element = {
      id: data.id,
      username: data.username,
      email: data.email,
      Roles: rolesData
    }

    return element;
  },

  // Therapist

  /* The `therapistDataStructure(data)` function is creating a new data structure for therapists by
  iterating over the input `data` array. It extracts specific information from each therapist object
  in the array and organizes it into a new structure. Here's a breakdown of what it does: */
  therapistDataStructure(data) {
    // variables
    const newData = [];

    for (const iterator of data) {

      const children = [];
      
      if(iterator.patientTherapist) {
        for (const patient of iterator.patientTherapist) {

          // Get age from Patient
          const childAge = dates.getAge(patient);

          // Full Name validation
          let fullName = `${patient.Person.firstName} ${patient.Person.secondName} ${patient.Person.surname} ${patient.Person.secondSurname}`;
          if(!patient.Person.secondName || !patient.Person.secondSurname) {
            fullName = `${patient.Person.firstName} ${patient.Person.surname}`;
          }

          const childInfo = {
            id: patient.id,
            userId: patient.userId,
            fullName,
            age: childAge.Person.dataValues.age,
          }
          children.push(childInfo);
        }
      }

      let fullName = `${iterator.Person.firstName} ${iterator.Person.secondName} ${iterator.Person.surname} ${iterator.Person.secondSurname}`;
      if(!iterator.Person.secondName || !iterator.Person.secondSurname) {
        fullName = `${iterator.Person.firstName} ${iterator.Person.surname}`;
      }
      
      const element = {
        id: iterator.id,
        userId: iterator.userId,
        fullName,
        username: iterator.User.username,
        email: iterator.User.email,
        phoneNumber: iterator.phoneNumber,
        telephone: iterator.telephone,
        patients: children
      };

      newData.push(element);
    }

    return newData;
  },

  findTherapistDataStructure(data) {

    const children = [];

    if(data.patientTherapist) {
      for (const patient of data.patientTherapist) {

        // Get age from Patient
        const childAge = dates.getAge(patient);

        // Full Name validation
        let fullName = `${patient.Person.firstName} ${patient.Person.secondName} ${patient.Person.surname} ${patient.Person.secondSurname}`;
        if(!patient.Person.secondName || !patient.Person.secondSurname) {
          fullName = `${patient.Person.firstName} ${patient.Person.surname}`;
        }
        
        const childInfo = {
          id: patient.id,
          userId: patient.userId,
          fullName,
          age: childAge.Person.dataValues.age,
        }
        children.push(childInfo);
      }
    }

    let fullName = `${data.Person.firstName} ${data.Person.secondName} ${data.Person.surname} ${data.Person.secondSurname}`;
    if(!data.Person.secondName || !data.Person.secondSurname) {
      fullName = `${data.Person.firstName} ${data.Person.surname}`;
    }

    const element = {
      id: data.id,
      userId: data.userId,
      fullName,
      image: data.Person.imageProfile,
      username: data.User.username,
      email: data.User.email,
      phoneNumber: data.phoneNumber,
      identificationNumber: data.identificationNumber,
      telephone: data.telephone,
      address: data.Person.address,
      patients: children,
    }

    return element;
  },


  // Patient 

  /* The `patientDataStructure(data)` function is responsible for creating a new data structure for
  patients by iterating over the input `data` array. It extracts specific information from each
  patient object in the array and organizes it into a new structure. Here's a breakdown of what it
  does: */
  patientDataStructure(data) {
    // Variables
    const newData = [];

    for (const iterator of data) {

      const childAge = dates.getAge(iterator);

      const element = {
        id: iterator.id,
        userId: iterator.userId,
        fullName: `${iterator.Person.firstName} ${iterator.Person.secondName ? iterator.Person.secondName : ''} ${iterator.Person.surname} ${iterator.Person.secondSurname ? iterator.Person.secondSurname : ''}`,
        age: childAge.Person.dataValues.age,
        // GRADO
        // FASE
        // Cantidad de logros
      }
      newData.push(element);
    }
    return newData;
  },

  findPatientDataStructure(data) {

    // get Age from Patient
    const childAge = dates.getAge(data);

    // Full Name validation

    let fullName = `${data.Person.firstName} ${data.Person.secondName} ${data.Person.surname} ${data.Person.secondSurname}`; // Patient
    if(!data.Person.secondName || !data.Person.secondSurname) {
      fullName = `${data.Person.firstName} ${data.Person.surname}`;
    }

    let tutorFullName = `${data.tutor.Person.firstName} ${data.tutor.Person.secondName} ${data.tutor.Person.surname} ${data.tutor.Person.secondSurname}`; // Tutor
    if(!data.tutor.Person.secondName || !data.tutor.Person.secondSurname) {
      tutorFullName = `${data.tutor.Person.firstName} ${data.tutor.Person.surname}`;
    }

    let therapistFullName = `${data.therapist.Person.firstName} ${data.therapist.Person.secondName} ${data.therapist.Person.surname} ${data.therapist.Person.secondSurname}`; // Therapist
    if(!data.therapist.Person.secondName || !data.therapist.Person.secondSurname) {
      therapistFullName = `${data.therapist.Person.firstName} ${data.therapist.Person.surname}`;
    }



    return {
      id: data.id,
      userId: data.userId,
      fullName,
      image: data.Person.imageProfile,
      age: childAge.Person.dataValues.age,
      gender: data.Person.gender,
      username: data.User.username,
      address: data.Person.address,
      // Grado de autismo
      // Fase actual
      // Progreso
      email: data.User.email,
      birthday: data.Person.birthday,
      telephone: data.tutor.telephone ? data.tutor.telephone : data.tutor.phoneNumber,
      // Observaciones
      /*
        Lista de logros Conseguidos: {
          Nombre
          Imagen
        }
      */
      tutor: {
        id: data.tutor.id,
        userId: data.tutor.userId,
        image: data.tutor.Person.imageProfile,
        fullName: tutorFullName,
        username: data.tutor.User.username,
        correo: data.tutor.User.email,
        telefono: data.tutor.telephone ? data.tutor.telephone : data.tutor.phoneNumber,
      },
      therapist: {
        id: data.therapist.id,
        userId: data.therapist.userId,
        image: data.therapist.Person.imageProfile,
        fullName: therapistFullName,
        username: data.therapist.User.username,
        email: data.therapist.User.email,
        phoneNumber: data.therapist.phoneNumber
      },
    /*
        Informacion de la actividad asignada: {
          id
          nombre
          descripcion
          fase
          progreso
        }
      */
      /*
        Lista de actividades completadas relacionadas al paciente: {
          id
          nombre
          descripcion
          fase
        }
      */
      /*
        Lista de Pictogramas personalizados del Paciente: {
          id
          imagen
          nombre
        }
      */
    } 

  }

}