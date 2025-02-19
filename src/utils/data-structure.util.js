const dates = require('./dates.util');
const { getPatient, getTutorTherapist } = require('../helpers/auth.helper');

/* eslint-disable no-restricted-syntax */
module.exports = {


  /*
    * User Structure
  */

  /* The `userDataStructure(data)` function is creating a new data structure for users by iterating
  over the input `data` array. It extracts specific information from each user object in the array
  and organizes it into a new structure. Here's a breakdown of what it does: */
  async userDataStructure(data) {

    const newData = [];
    
     /* eslint-disable no-restricted-syntax */
    /* eslint-disable no-await-in-loop */
    for (const iterator of data) {
      const rolesData = [];

      if(iterator.UserRoles.length > 0) {
        for (const role of iterator.UserRoles) {
          rolesData.push(role.Role);
  
          if(role.Role.id === 3) {
            const { data: therapistData } = await getTutorTherapist(iterator.id);
            iterator.setDataValue('profileId', therapistData.profileId);
          }
          if(role.Role.id === 4) {
            const { data: patientData } = await getPatient(iterator.id);
            iterator.setDataValue('profileId', patientData.profileId);
          }
          if(role.Role.id === 5) {
            const { data: tutorData } = await getTutorTherapist(iterator.id);;
            iterator.setDataValue('profileId', tutorData.profileId);
          } 
  
        }
      }


      const element = {
        id: iterator.id,
        profileId: iterator.dataValues.profileId ?? null,
        username: iterator.username,
        email: iterator.email,
        roles: rolesData ?? null,
      }
      newData.push(element);
    }

    return newData;
  },

  async findUserDataStructure(data) {

    // Variables
    const rolesData = [];
    let isAdmin;
    let element;

    /* eslint-disable no-restricted-syntax */
    /* eslint-disable no-await-in-loop */
    if(data.UserRoles.length > 0) {
      for (const role of data.UserRoles) {
        if(role.Role.id === 2) {
          isAdmin = true;
        }
  
        if(role.Role.id === 3) {
          const { data: therapistData } = await getTutorTherapist(data.id);
          data.setDataValue('profileId', therapistData.profileId);
        }
        if(role.Role.id === 4) {
          const { data: patientData } = await getPatient(data.id);
          data.setDataValue('profileId', patientData.profileId);
        }
        if(role.Role.id === 5) {
          const { data: tutorData } = await getTutorTherapist(data.id);
          data.setDataValue('profileId', tutorData.profileId);
        }
  
        rolesData.push(role.Role);
      }
    }

    if(isAdmin) {
      element = {
        id: data.dataValues.id,
        username: data.dataValues.username,
        email: data.dataValues.email,
        roles: rolesData ?? null,
      }
    } else {
      element = {
        id: data.dataValues.id,
        profileId: data.dataValues.profileId,
        username: data.dataValues.username,
        email: data.dataValues.email,
        roles: rolesData ?? null,
      }
    }


    return element;
  },

  /*
    * Therapist Structure
  */
  /* The `therapistDataStructure(data)` function is creating a new data structure for therapists by
  iterating over the input `data` array. It extracts specific information from each therapist object
  in the array and organizes it into a new structure. Here's a breakdown of what it does: */
  therapistDataStructure(data, create = false) {
    // variables
    const newData = [];
    let createDataStructure;

    if(create) {
      let fullName = `${data.Person.firstName} ${data.Person.secondName} ${data.Person.surname} ${data.Person.secondSurname}`;
      if(!data.Person.secondName || !data.Person.secondSurname) {
        fullName = `${data.Person.firstName} ${data.Person.surname}`;
      }
      
      createDataStructure = {
        id: data.id,
        userId: data.userId,
        image: data.Person.imageProfile ?? null,
        fullName,
        email: data.User.email,
        username: data.User.username,
        phoneNumber: data.phoneNumber ? `${data.phoneNumber}` : null,
        childrenInCharge: data.patientTherapist.length > 0 ? data.patientTherapist.length : null,
      };
    }

    if(!create) {
      for (const iterator of data) {
  
        let fullName = `${iterator.Person.firstName} ${iterator.Person.secondName} ${iterator.Person.surname} ${iterator.Person.secondSurname}`;
        if(!iterator.Person.secondName || !iterator.Person.secondSurname) {
          fullName = `${iterator.Person.firstName} ${iterator.Person.surname}`;
        }
        
        const element = {
          id: iterator.id,
          userId: iterator.userId,
          image: iterator.Person.imageProfile ?? null,
          fullName,
          email: iterator.User.email,
          username: iterator.User.username,
          phoneNumber: iterator.phoneNumber ? `${iterator.phoneNumber}` : null,
          childrenInCharge: iterator.patientTherapist.length > 0 ? iterator.patientTherapist.length : null,
        };
  
        newData.push(element);
      }
    }


    return create ? createDataStructure : newData;
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

         // phase 
          const getPhase = Object.keys(patient).includes('HealthRecord') && patient.HealthRecord !== null ? {
            id: patient.HealthRecord.Phase.id,
            name: patient.HealthRecord.Phase.name,
            description: patient.HealthRecord.Phase.description,
          } : null;

        // TeaDegree
        const getTeaDegree = Object.keys(patient).includes('HealthRecord') && patient.HealthRecord !== null ? {
          id: patient.HealthRecord.TeaDegree.id,
          name: patient.HealthRecord.TeaDegree.name,
          description: patient.HealthRecord.TeaDegree.description,
        } : null;
        
        const childInfo = {
          id: patient.id,
          userId: patient.userId,
          fullName,
          age: childAge.Person.dataValues.age,
          teaDegree: getTeaDegree,
          currentPhase: getPhase,
          achievementCount: 0,
          image: patient.Person.imageProfile ?? null,
          // Grado de autismo
          // cantidad de logros
        }
        children.push(childInfo);
      }
    }

    // Therapist Fullname validation
    let fullName = `${data.Person.firstName} ${data.Person.secondName} ${data.Person.surname} ${data.Person.secondSurname}`;
    if(!data.Person.secondName || !data.Person.secondSurname) {
      fullName = `${data.Person.firstName} ${data.Person.surname}`;
    }

    // Get age from therapist 
    const therapistAge = dates.getAge(data);

    const element = {
      id: data.id,
      userId: data.userId,
      fullName,
      firstName: data.Person.firstName,
      secondName: data.Person.secondName ?? null,
      surname: data.Person.surname,
      secondSurname: data.Person.secondSurname ?? null,
      gender: data.Person.gender ? `${data.Person.gender.charAt(0).toUpperCase() + data.Person.gender.slice(1)}` : null,
      birthday: data.Person.birthday,
      age: therapistAge.Person.dataValues.age,
      image: data.Person.imageProfile ?? null,
      username: data.User.username,
      email: data.User.email,
      identificationNumber: data.identificationNumber,
      phoneNumber: data.phoneNumber ? `${data.phoneNumber}` : null,
      address: data.Person.address,
      children: children.length > 0 ? children : null,
      activities: data.User.Activities.length > 0 ? data.User.Activities.filter((condition) => condition.status === true).map((item) => ({
        id: item.id,
        name: item.name,
        satisfactoryPoints: item.satisfactoryPoints,
        description: item.description,
        phase: {
          id: item.Phase.id,
          name: item.Phase.name,
          description: item.Phase.description,
        },
      })) : null,
      /*
        Lista de actividaes creadas por el terapueta
        name
        description
        points
        fase
      */
    }

    return element;
  },


  updateTherapistDataStructure(data) {

    return  {
      id: data.id,
      firstName: data.Person.firstName,
      secondName: data.Person.secondName ?? null,
      surname: data.Person.surname,
      secondSurname: data.Person.secondSurname ?? null,
      gender: data.Person.gender ? `${data.Person.gender.charAt(0).toUpperCase() + data.Person.gender.slice(1)}` : null,
      birthday: data.Person.birthday ?? null,
      image: data.Person.imageProfile ?? null,
      username: data.User.username,
      email: data.User.email,
      identificationNumber: data.identificationNumber ?? null,
      phoneNumber: data.phoneNumber ? `${data.phoneNumber}` : null,
      address: data.Person.address ?? null,
    }
  },

  /*
    * Tutor Structure
  */
  tutorDataStructure(data, create = false) {
    // Variables
    const newData = [];
    let createDataStructure;

    if(create) {
      // Tutor Fullname validatio
      let fullName = `${data.Person.firstName} ${data.Person.secondName} ${data.Person.surname} ${data.Person.secondSurname}`;
      if(!data.Person.secondName || !data.Person.secondSurname) {
        fullName = `${data.Person.firstName} ${data.Person.surname}`;
      }

      createDataStructure = {
        id: data.id,
        userId: data.userId ?? null,
        image: data.Person.imageProfile ?? null,
        fullName,
        email: data.User.email ?? null,
        username: data.User.username,
        phoneNumber: data.phoneNumber ? `${data.phoneNumber}` : null,
        telephone: data.telephone ? `${data.telephone}` : null,
        childrenInCharge: data.patientTutor.length > 0 ? data.patientTutor.length : null,
      }
      
    }

    if(!create) {
      for(const iterator of data) {

        // Tutor Fullname validatio
        let fullName = `${iterator.Person.firstName} ${iterator.Person.secondName} ${iterator.Person.surname} ${iterator.Person.secondSurname}`;
        if(!iterator.Person.secondName || !iterator.Person.secondSurname) {
          fullName = `${iterator.Person.firstName} ${iterator.Person.surname}`;
        }
  
        const element = {
          id: iterator.id,
          userId: iterator.userId,
          image: iterator.Person.imageProfile ?? null,
          fullName,
          email: iterator.User.email ?? null,
          username: iterator.User.username,
          phoneNumber: iterator.phoneNumber ? `${iterator.phoneNumber}` : null,
          telephone: iterator.telephone ? `${iterator.telephone}` : null,
          childrenInCharge: iterator.patientTutor.length > 0 ? iterator.patientTutor.length : null,
        }
        newData.push(element);
      }
    }

    return create ? createDataStructure : newData;
  },
  
  findTutorDataStructure(data) {

    const children = [];

    if(data.patientTutor) {
      for (const patient of data.patientTutor) {
        
        // Get age from Patient
        const childAge = dates.getAge(patient);

        // Full Name validation
        let fullName = `${patient.Person.firstName} ${patient.Person.secondName} ${patient.Person.surname} ${patient.Person.secondSurname}`;
        if(!patient.Person.secondName || !patient.Person.secondSurname) {
          fullName = `${patient.Person.firstName} ${patient.Person.surname}`;
        }

        // phase 
        const getPhase = Object.keys(patient).includes('HealthRecord') && patient.HealthRecord !== null ? {
          id: patient.HealthRecord.Phase.id,
          name: patient.HealthRecord.Phase.name,
          description: patient.HealthRecord.Phase.description,
        } : null;

      // TeaDegree
      const getTeaDegree = Object.keys(patient).includes('HealthRecord') && patient.HealthRecord !== null ? {
        id: patient.HealthRecord.TeaDegree.id,
        name: patient.HealthRecord.TeaDegree.name,
        description: patient.HealthRecord.TeaDegree.description,
      } : null;

        const childInfo = {
          id: patient.id,
          userId: patient.userId,
          fullName,
          age: childAge.Person.dataValues.age,
          teaDegree: getTeaDegree,
          currentPhase: getPhase,
          achievementCount: 0,
          image: patient.Person.imageProfile ?? null,
          // Grado de Autismo
          // Fase
          // Cantidad de logros
        }
        children.push(childInfo);
      }
    }

    // Get Age from Tutor
    const tutorAge = dates.getAge(data);

    // Tutor Fullname validation
    let fullName = `${data.Person.firstName} ${data.Person.secondName} ${data.Person.surname} ${data.Person.secondSurname}`;
    if(!data.Person.secondName || !data.Person.secondSurname) {
      fullName = `${data.Person.firstName} ${data.Person.surname}`;
    }

    const element = {
      id: data.id,
      userId: data.userId ?? null,
      fullName,
      firstName: data.Person.firstName,
      secondName: data.Person.secondName ?? null,
      surname: data.Person.surname,
      secondSurname: data.Person.secondSurname ?? null,
      gender: data.Person.gender ? `${data.Person.gender.charAt(0).toUpperCase() + data.Person.gender.slice(1)}` : null,
      birthday: data.Person.birthday,
      age: tutorAge.Person.dataValues.age,
      image: data.Person.imageProfile ?? null,
      username: data.User.username,
      email: data.User.email,
      identificationNumber: data.identificationNumber,
      phoneNumber: data.phoneNumber ? `${data.phoneNumber}` : null,
      telephone: data.telephone ? `${data.telephone}` : null,
      address: data.Person.address ?? null,
      children: children.length > 0 ? children : null,
    }

    return element;
  },


  updateTutorDataStructure(data) {

    return  {
      id: data.id,
      firstName: data.Person.firstName ?? null,
      secondName: data.Person.secondName ?? null,
      surname: data.Person.surname ?? null,
      secondSurname: data.Person.secondSurname ?? null,
      gender: data.Person.gender ? `${data.Person.gender.charAt(0).toUpperCase() + data.Person.gender.slice(1)}` : null,
      birthday: data.Person.birthday ?? null,
      image: data.Person.imageProfile ?? null,
      username: data.User.username,
      email: data.User.email,
      identificationNumber: data.identificationNumber,
      phoneNumber: data.phoneNumber ? `${data.phoneNumber}` : null,
      telephone: data.telephone ? `${data.telephone}` : null,
      address: data.Person.address ?? null,
    }
    

  },


  /*
    * Patient Structure
  */

  /* The `patientDataStructure(data)` function is responsible for creating a new data structure for
  patients by iterating over the input `data` array. It extracts specific information from each
  patient object in the array and organizes it into a new structure. Here's a breakdown of what it
  does: */
  patientDataStructure(data) {
    // Variables
    const newData = [];

    for (const iterator of data) {

      const childAge = dates.getAge(iterator);

      // phase
      const getPhase = Object.keys(iterator).includes('HealthRecord') && iterator.HealthRecord !== null ? {
        id: iterator.HealthRecord.Phase.id,
        name: iterator.HealthRecord.Phase.name,
        description: iterator.HealthRecord.Phase.description,
      } : null;

      // TeaDegree
      const getTeaDegree = Object.keys(iterator).includes('HealthRecord') && iterator.HealthRecord !== null ? {
        id: iterator.HealthRecord.TeaDegree.id,
        name: iterator.HealthRecord.TeaDegree.name,
        description: iterator.HealthRecord.TeaDegree.description,
      } : null;

      const element = {
        id: iterator.id,
        userId: iterator.userId,
        fullName: `${iterator.Person.firstName} ${iterator.Person.secondName ? iterator.Person.secondName : ''} ${iterator.Person.surname} ${iterator.Person.secondSurname ? iterator.Person.secondSurname : ''}`,
        age: childAge.Person.dataValues.age,
        teaDegree: getTeaDegree,
        currentPhase: getPhase,
        achievementCount: 0,
        image: iterator.Person.imageProfile,
        // Cantidad de logros
      }
      newData.push(element);
    }
    return newData;
  },

  findPatientDataStructure(data) {
    
    // Variables
    let therapistFullName;

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

    if(data.therapist) {
      therapistFullName = `${data.therapist.Person.firstName} ${data.therapist.Person.secondName} ${data.therapist.Person.surname} ${data.therapist.Person.secondSurname}`; // Therapist
      if(!data.therapist.Person.secondName || !data.therapist.Person.secondSurname) {
        therapistFullName = `${data.therapist.Person.firstName} ${data.therapist.Person.surname}`;
      }
    }

   // Get the observations
    const observationsGotit = Object.keys(data).includes('HealthRecord') && data.HealthRecord !== null && Object.keys(data.HealthRecord.Observations) !== null 
    ? data.HealthRecord.Observations.map((item) => {
      return {
        id: item.id,
        description: item.description,
        username: item.User ? item.User.username : null,
        createdAt: item.createdAt ? item.createdAt : null,
      }
    }) : null;

    // phase 
    const getPhase = Object.keys(data).includes('HealthRecord') && data.HealthRecord !== null ? {
      id: data.HealthRecord.Phase.id,
      name: data.HealthRecord.Phase.name,
      description: data.HealthRecord.Phase.description,
    } : null;

    // TeaDegree
    const getTeaDegree = Object.keys(data).includes('HealthRecord') && data.HealthRecord !== null ? {
      id: data.HealthRecord.TeaDegree.id,
      name: data.HealthRecord.TeaDegree.name,
      description: data.HealthRecord.TeaDegree.description,
    } : null;

    return {
      id: data.id,
      userId: data.userId,
      fullName,
      firstName: data.Person.firstName,
      secondName: data.Person.secondName,
      surname: data.Person.surname,
      secondSurname: data.Person.secondSurname,
      gender: data.Person.gender,
      age: childAge.Person.dataValues.age,
      image: data.Person.imageProfile,
      username: data.User.username,
      email: data.User.email,
      birthday: data.Person.birthday,
      teaDegree: getTeaDegree,
      currentPhase: getPhase,
      phaseProgress: data.phaseProgress,
      telephone: data.tutor.telephone ? data.tutor.telephone : data.tutor.phoneNumber,
      address: data.Person.address,
      observations: observationsGotit,
      achievements: null,
      
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
        email: data.tutor.User.email,
        telephone: data.tutor.telephone ? data.tutor.telephone : data.tutor.phoneNumber,
      },
      therapist: data.therapist ? {
        id: data.therapist.id,
        userId: data.therapist.userId,
        image: data.therapist.Person.imageProfile,
        fullName: therapistFullName,
        username: data.therapist.User.username,
        email: data.therapist.User.email,
        phoneNumber: data.therapist.phoneNumber
      } : null,
    /*
        Informacion de la actividad asignada: {
          id
          nombre
          descripcion
          fase
          progreso
        }
      */
      currentActivity: null,
      /*
        Lista de actividades completadas relacionadas al paciente: {
          id
          nombre
          descripcion
          fase
        }
      */
      activities: null,
      /*
        Lista de Pictogramas personalizados del Paciente: {
          id
          imagen
          nombre
        }
      */
      pictograms: null,
    } 
  },

  /*
    * Me Structure
  */
  async meDataStructure(data) {

    const roles = [];
    /* eslint-disable no-restricted-syntax */
    /* eslint-disable no-await-in-loop */
    for (const iterator of data.UserRoles) {
      if(iterator.Role.id === 1) {
        data.setDataValue('superAdmin', true);
      }
      if(iterator.Role.id === 2) {
        data.setDataValue('admin', true);
      }
      if(iterator.Role.id === 3) {
        const { data: therapistData } = await getTutorTherapist(data.id);
        data.setDataValue('profile', therapistData);
      }
      if(iterator.Role.id === 4) {
        const { data: patientData } = await getPatient(data.id);
        data.setDataValue('profile', patientData);
      }
      if(iterator.Role.id === 5) {
        const { data: tutorData } = await getTutorTherapist(data.id);;
        data.setDataValue('profile', tutorData);
      }
      roles.push(iterator.Role);
    }

    // customizing UserRoles

    const { UserRoles, ...resData } = data.dataValues;

    const newData = {
      ...resData,
      roles,
    }

    return newData;
  },


  /*
    * Custom Pictograms Structure
  */

  customPictogramDataStructure(data){

    // Variables
    const newData = [];

    for (const item of data) {

      if(item.Pictogram) {
        const element = {
          id: item.id,
          name: item.name,
          imageUrl: item.imageUrl,
          Category: {
            id: item.Pictogram.Category.id,
            name: item.Pictogram.Category.name,
          }
        }

        newData.push(element);
      }

      if(!item.Pictogram) {
        newData.push(item);
      }

    }

    return newData;
  },

  findCustomPictogramDataStructure(data) {
    return {
      id: data.id,
      name: data.name,
      imageUrl: data.imageUrl,
      Category: {
        id: data.Pictogram.Category.id,
        name: data.Pictogram.Category.name,
      }
    }
  },

  /*
    * Activity Structure
  */


  activityDataStructure(data) {
    // something here
    const newData = [];

    data.forEach((item) => {
        newData.push({
          id: item.id,
          name: item.name,
          description: item.description,
          satisfactoryPoints: item.satisfactoryPoints,
          phase: {
            id: item.Phase.id,
            name: item.Phase.name,
            description: item.Phase.description,
          },
          assignments: item.PatientActivities.length > 0 ?  item.PatientActivities.map((p) => {
            return {
              id: p.Patient.id,
            }
          }): null
        })
    });

    return newData;
  },


  findActivityDataStructure(data) {

    const newData = {
      id: data.id,
      name: data.name,
      description: data.description,
      satisfactoryPoints: data.satisfactoryPoints,
      phase: {
        id: data.Phase.id,
        name: data.Phase.name,
        description: data.Phase.description,
      },
      assignments: data.PatientActivities !== null ?  data.PatientActivities.map((p) => {
        return {
          id: p.Patient.id,
        }
      }): null,
      activitySolution: {
        pictogramsSolution: data.dataValues.pictograms,
        textSolution: data.pictogramSentence
      }
    };

    return newData;

  }


}