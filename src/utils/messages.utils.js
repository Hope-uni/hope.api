const messages = {
  generalMessages: {
    base: `Hubo un problema con los datos ingresados. Verifique los datos e intente nuevamente`,
    server: `Hubo un problema inesperado. Por favor, intente más tarde`,
    bad_request: 'BAD_REQUEST',
    unauthorized: 'UNAUTHORIZED',
    not_found: 'NOT_FOUND',
    conflict: 'CONFLICT',
    forbidden: `No tiene permiso para realizar esta acción`,
    unknown_object: 'Esta propiedad no está permitida',
  },

  // Auth Module
  auth: {
    fields: {
      username_email: 'Nombre de usuario o correo es necesario para iniciar sesión',
      username: {
        required: `Nombre de usuario es requerido`,
        base: `Nombre de usuario debe ser un texto válido`,
        empty: `Nombre de usuario no debe estar vacío`
      },
      email: {
        required: `Correo es requerido`,
        format: `Correo debe ser válido`,
        base: `Correo debe ser válido`,
        empty: `Correo no debe estar vacío`,
      },
      password: {
        required: `Contraseña es requerida`,
        base: `Contraseña debe ser un texto válido`,
        empty: `Contraseña no debe estar vacía`,
        pattern: `Contraseña debería tener entre 8 y 30 carácteres además de contener letras y números`,
        not_match: `Contraseñas no coinciden`,
        min: `Contraseña debe tener al menos 8 caracteres`,
      },
      newPassword: {
        required: `Nueva contraseña es requerida`,
        base: `Nueva contraseña debe ser un texto válido`,
        empty: `Nueva contraseña no debe estar vacía`,
        pattern: `Nueva contraseña debería tener entre 8 y 30 carácteres además de contener letras y números`,
        not_match: `Contraseñas no coinciden`,
      },
      confirmPassword: {
        required: 'Confirmación de Contraseña es requerida' ,
      },
      emailUsername: {
        required: ` Nombre de usuario o correo son requeridos`,
        empty: ` Nombre de usuario o correo dede ser digitado`,
        base: ` Nombre de usuario o correo deben ser un texto válido`,
      }
    },
    errors: {
      controller: `Hubo un error en el controlador del modulo Auth`,
      service: {
        login: {
          base: `Hubo un error en el servicio "Inicio de Sesión" del modulo Auth`,
          password_not_match: `Usuario o contraseña incorrectos`,
          generate_token_error: `Hubo un error al momento de iniciar sesión`,
          login_required: `Inicio de sesión es requerido`,
          user_verified: `Usuario no verificado`,
        },
        forgot_password: {
          base: `Hubo un error en el servicio "Olvidó Contraseña" del modulo Auth`,
          send_email: `Hubo un error a enviar el correo para restaurar la contraseña`,
        },
        reset_password: {
          base: `Hubo un error en el servicio "Cambiar Contraseña" del modulo Auth`,
          update_password: `Hubo un error al momento de restaurar la contraseña`,
        },
        change_password: {
          base: `Hubo un error en el servicio "Cambiar Contraseña"`,
          incorrect_password: `Contraseña actual incorrecta`,
          update_password: `Hubo un error al momento de cambiar la contraseña`,
        },
        change_default_password: {
          base: `Hubo un error en el servicio "Cambiar Contraseña por Defecto"`,
        },
        me: {
          base: `Hubo un error en el servicio "Mi Perfil" del modulo Auth`,
          payload_empty: `Payload esta vacio`,
          get_patient: `There was an error trying to get Patient in me endpoint`,
          get_tutorTherapist: `There was an error trying to get TutorTherapist in me endpoint`,
        },
        refresh_auth: {
          base: `Hubo un error en el servicio "Refrescar Token" del modulo Auth`,
          token_invalid: {
            base: `Token no válido`,
            empty: `El token de actualización está vacío`
          },
          update_token: `Token no actualizado`,
          remove_token: `Token no Eliminado`
        },
      },
      not_found: {
        token: `Token no encontrado`,
        email_username: `El nombre de usuario o correo ingresado no está registrado en nuestro sistema. Por favor, verifica la información proporcionada`,
        tutorTherapist: `Tutor o terapeuta no encontrado`,
      }
    },
    success: {
      login: `Inicio de sesión existoso!`,
      forgot_password: `Correo enviado satisfactoriamente`,
      reset_password: `Contraseña restaurada satisfactoriamente`,
      change_password: `Cambio de contraseña existoso`,
      change_default_password: `Contraseña por defecto cambiada satisfactoriamente`,
      me: `Información del usuario`,
      refresh_auth: `Token actualizado satisfactoriamente`,
      refresh_token: `Refresh token eliminado`,
    }
  },

  // Therapist Module
  therapist: {
    fields: {
      id: {
        required: `Identificador del Terapeuta es requerido`,
        base: `Identificador del Terapeuta debe ser un número válido`,
        positive: `Identificador del Terapeuta debe ser un número positivo`
      },
      identificationNumber: {
        required: `Cédula es requerida`,
        pattern: `Cédula debe ser válida`,
      },
      phoneNumber: {
        required: `Teléfono es requerido`,
        pattern: `Teléfono debe ser válido y debe tener como maximo 8 digitos`,
        base: `Teléfono debe ser válido`
      },
      patients: {
        required: `Paciente es requerido`,
        base: `Identificador de paciente debe ser un número válido`,
        positive: `Identificador de paciente debe ser un número positivo`,
        unique: `Debe seleccionar pacientes diferentes para poder asignar Terapeuta`,
        array: `Debe enviar los pacientes seleccionados en un formato válido`,
        array_min: `Debe seleccionar al menos un paciente para poder asignarle un Terapeuta`,
      }
    },
    errors: {
      controller: `Hubo un error en el controlador de terapeuta`,
      service: {
        base: `Hubo un error en el servicio de terapeuta`,
        create: `Terapeuta no creado`,
        update: `Terapeuta no actualizado`,
        delete: `Terapeuta no fue eliminado`,
        not_role: `El rol que está asignando a Terapeuta es inadmisible`,
        therapist_assigned: `El paciente ya tiene asignado un terapeuta`,
        therapist_not_assigned: `Terapeuta no fue asignado al Paciente`,
        patient_to_assign: `Uno de los pacientes que esta intentando asignar no existe, porfavor verifique que todos los pacientes esten en el sistema`,	
      },
      not_found: `Terapeuta no encontrado`,
      in_use: {
        identificationNumber: `Cédula ya está en uso`,
        phoneNumber: `El numero de teléfono ya está en uso`
      }
    },
    success:{
      all: `Lista de Terapeutas`,
      found: `Terapeuta encontrado`,
      create: `Terapeuta creado`,
      update: `Terapeuta actualizado`,
      delete: `Terapeuta eliminado`,
      assign: `Terapeuta asignado exitosamente`,
    }
  },

  // Tutor Module
  tutor: {
    fields: {
      id: {
        required: `Identificador del Tutor es requerido`,
        base: `Identificador del Tutor debe ser un número válido`,
        positive: `Identificador del Tutor debe ser un número positivo`
      },
      identificationNumber: {
        required: `Cédula es requerida`,
        pattern: `Cédula debe ser válida`,
      },
      phoneNumber: {
        required: `Teléfono es requerido`,
        pattern: `Teléfono debe ser válido y debe tener como maximo 8 digitos`,
        base: `Teléfono debe ser válido`
      }
    },
    errors: {
      controller: `Hubo un error en el controlador de tutor`,
      service: {
        base: `Hubo un error en el servicio de tutor`,
        create: `Tutor no creado`,
        update: `Tutor no actualizado`,
        delete: `Tutor no fue eliminado`,
        not_role: `El rol que está asignando al Tutor es inadmisible`,
      },
      not_found: `Tutor no encontrado`,
      in_use: {
        identificationNumber: `Cédula ya está en uso`,
        phoneNumber: `El numero de teléfono ya está en uso`
      }
    },
    success: {
      all: `Lista de Tutores`,
      found: `Tutor encontrado`,
      create: `Tutor creado`,
      update: `Tutor actualizado`,
      delete: `Tutor eliminado`
    }
  },

  // Patient Module
  patient: {
    fields: {
      id: {
        required: `Identificador del Paciente es requerido`,
        base: `Identificador del Paciente debe ser un número válido`,
        positive: `Identificador del Paciente debe ser un número positivo`
      },
      age: {
        required: `Edad es requerida`,
        base: `Edad debe ser un numero válido`,
        positive: `Edad debe ser un número positivo mayor a cero`
      },
      observations: {
        base: `Observaciones deben ser enviadas en formato válido`,
      }
    },
    errors: {
      controller: `Hubo un error en el controlador de paciente`,
      service: {
        base: `Hubo un error en el servicio de paciente`,
        create: `Paciente no creado`,
        update: `Paciente no actualizado`,
        delete: `Paciente no fue eliminado`,
        not_role: `El rol que está asignando a Paciente es inadmisible`,
        user_person_incorrect: `Identificador de usuario o identificador de persona no son correctos`,
        forbidden: `No tienes permíso de listar pacientes que no están relacionados contigo`,
        no_registered: `Pacientes no registrados`,
      },
      not_found: `Paciente no encontrado`,
      in_use: {
        identificationNumber: `Cédula ya está en uso`,
        phoneNumber: `El numero de teléfono ya está en uso`
      }
    },
    success: {
      all: `Lista de Pacientes`,
      found: `Paciente encontrado`,
      create: `Paciente creado`,
      update: `Paciente actualizado`,
      delete: `Paciente eliminado`
    }
  },

  // User Module
  user: {
    fields: {
      id: {
        required: `Identificador del Usuario es requerido`,
        base: `Identificador del Usuario debe ser un número válido`,
        positive: `Identificador del Usuario debe ser un número positivo`
      },
      username: {
        required: `Nombre de usuario es requerido`,
        base: `Nombre de usuario debe ser un texto válido`,
        empty: `Nombre de usuario no debe estar vacío`,
        min: `El nombre de usuario debe tener como mínimo 6 y como máximo 16 caracteres`,
        max: `El nombre de usuario debe tener como mínimo 6 y como máximo 16 caracteres`
      },
      email: {
        required: `Correo es requerido`,
        format: `Correo debe ser válido`,
        base: `Correo debe ser válido`,
        empty: `Correo no debe estar vacío`,
      },
      password: {
        required: `Contraseña es requerida`,
        base: `Contraseña debe ser un texto válido`,
        empty: `Contraseña no debe estar vacía`,
        pattern: `Contraseña debería tener entre 8 y 30 carácteres además de contener letras y números`,
        not_match: `Contraseñas no coinciden`
      },
      roles: {
        required: `Rol es requerido`,
        base: `Identificador del rol debe ser un número válido`,
        positive: `Identificador del rol debe ser un número positivo`,
        unique: `Debe asignar roles diferentes a un mismo usuario`
      }
    },
    errors: {
      controller: `Hubo un error en el controlador de usuario`,
      service: {
        base: `Hubo un error en el servicio de usuario`,
        create: `Usuario no creado`,
        update: `Usuario no actualizado`,
        delete: `Usuario no fue eliminado`,
        add_role: `Rol no fue agregado`,
        delete_role: `Rol no fue eliminado`,
        delete_role_user: `Este usuario no se le puede remover roles`,
      },
      not_found: `Usuario no encontrado`,
      forbidden: `El tipo de usuario que desea registrar solo debe ser admisible con el rol "Admin" `,
      rol_forbidden: `Este usuario no se le pueden asignar roles`,
      in_use: {
        username: `Nombre de usuario ya está en uso`,
        email: `Correo ya está en uso`,
      }
    },
    success: {
      all: `Lista de Usuarios`,
      found: `Usuario encontrado`,
      create: `Usuario creado`,
      update: `Usuario actualizado`,
      delete: `Usuario eliminado`,
      add_role: `Rol fue agregado correctamente`,
      delete_role: `Rol fue eliminado correctamente`,
    }
  },

  role: {
    fields: {
      id: {
        required: `Identificador del Rol es requerido`,
        base: `Identificador del Rol debe ser un número válido`,
        positive: `Identificador del Rol debe ser un número positivo`
      },
      name: {
        required: `Nombre de rol es requerido`,
        base: `Nombre de rol debe ser un texto válido`,
        empty: `Nombre de rol no debe estar vacío`
      },
      permissions: {
        required: `Permisos es requerido`,
        base: `Permisos deben ser enviados en formato válido.`,
        array_min: `Debe ingresar al menos un permiso.`,
        number: `Permisos deben ser un número válido`,
        positive: `Permisos deben ser un número positivo`
      }
    },
    errors: {
      controller: `Hubo un error en el controlador de rol`,
      service: {
        base: `Hubo un error en el servicio de rol`,
        create: `Rol no creado`,
        update: `Rol no actualizado`,
        delete: `Rol no fue eliminado`
      },
      not_found: `Rol no encontrado`,
      forbidden: `Este Usuario no se le puede asignar este Rol`,
      unsign_rol: `Este Usuario no se le puede remover este Rol`,
      in_use: {
        name: `Nombre de rol ya está en uso`,
        rol: `El usuario ya tiene este Rol`
      },
      permissions: {
        not_found: `Permiso no encontrado`
      }
    },
    success: {
      all: `Lista de Roles`,
      found: `Rol encontrado`,
      create: `Rol creado`,
      update: `Rol actualizado`,
      delete: `Rol eliminado`
    }
  },


  person: {
    fields: {
      firstName: {
        required: `Primer Nombre es requerido`,
        base: `Primer Nombre debe ser un texto válido`,
        empty: `Primer Nombre no debe estar vacío`,
        min: `Primer Nombre debe tener como minimo 3 caracteres`
      },
      secondName:{
        base: `Segundo Nombre debe ser un texto válido`,
        min: `Segundo Nombre debe tener como minimo 3 caracteres`
      },
      surname: {
        required: `Primer Apellido es requerido`,
        base: `Primer Apellido debe ser un texto válido`,
        empty: `Primer Apellido no debe estar vacío`,
        min: `Primer Apellido debe tener como minimo 3 caracteres`
      },
      secondSurname: {
        base: `Segundo Apellido debe ser un texto válido`,
        min: `Segundo Apellido debe tener como minimo 3 caracteres`
      },
      imageProfile: {
        base: `Imagen de perfil debe ser un texto válido`,
        empty: `Imagen de perfil no debe estar vacía`,
      },
      address: {
        required: `Dirección es requerida`,
        base: `Dirección debe ser un texto válido`,
        empty: `Dirección no debe estar vacía`,
        min: `La dirección proporcionada es muy corta. Por favor, proporciona una dirección más detallada.`
      },
      birthday: {
        required: 'Fecha de Nacimiento es requerida',
        min: 'Fecha de nacimiento indica una edad que sobrepasa el estandar de longevidad a nivel mundial.',
        format: 'Fecha de Nacimiento debe tener un formato de (Año-Mes-Dia)'
      },
      gender: {
        required: 'Sexo debe ser especificado',
        only: 'Sexo debe ser (Femenino | femenino) ó (Masculino | masculino)',
        base: 'Sexo debe ser un texto valido',
        empty: 'Sexo no puede estar vacío'
      }
    },
    errors: {
      service: {
        update: `La entidad persona que desea modificar no esta activa o no existe en el sistema`,
        create: `Hubo un error al intentar crear el perfil de personal`,
      },
      not_found: `Persona no encontrada`,
    }
  },


  // Category
  category: {
    fields: {
      id: {
        required: `Identificador de Categoría es requerido`,
        base: `Identificador de Categoría debe ser un número válido`,
        positive: `Identificador de Categoría debe ser un número positivo`
      },
      name: {
        required: `Nombre de categoría es requerido`,
        base: `Nombre de categoría debe ser un texto válido`,
        empty: `Nombre de categoría no debe estar vacío`,
        min: `Nombre de categoría debe tener como minimo 3 caracteres`
      },
      icon: {
        required: `Icono de categoría es requerido`,
        base: `Icono de categoría debe ser un texto válido`,
        empty: `Icono de categoría no debe estar vacío`
      },
    },
    errors: {
      controller: `Hubo un error en el controlador de Categoría`,
      service: {
        base: `Hubo un error en el servicio de Categoría`,
        create: `Categoría no creada`,
        update: `Categoría no actualizada`,
        delete: `Categoría no fue eliminada`
      },
      not_found: `Categoría no encontrada`,
      in_use: {
        name: `Nombre de categoría ya está en uso`,
        icon: `Icono ya está en uso`
      },
    },
    success: {
      all: `Lista de Categorías`,
      found: `Categoría encontrada`,
      create: `Categoría creada`,
      update: `Categoría actualizada`,
      delete: `Categoría eliminada`,
    }
  },

  pictogram: {
    fields: {
      id: {
        required: `Identificador de Pictograma es requerido`,
        base: `Identificador de Pictograma debe ser un número válido`,
        positive: `Identificador de Pictograma debe ser un número positivo`
      },
      name: {
        required: `Nombre de pictograma es requerido`,
        base: `Nombre de pictograma debe ser un texto válido`,
        empty: `Nombre de pictograma no debe estar vacío`,
        min: `Nombre de pictograma debe tener como minimo 3 caracteres`
      },
      image: {
        base: `Imagen del pictograma debe ser un texto válido`,
        required: `Imagen del pictograma es requerido`,
        empty: `Imagen del pictograma no debe estar vacío`,
      },
    },
    errors: {
      controller: `Hubo un error en el controlador de Pictograma`,
      controller2: `Hubo un error en el controlador de Paciente-Pictograma`,
      service: {
        base: `Hubo un error en el servicio de Pictograma`,
        base2: `Hubo un error en el servicio de Paciente-Pictograma`,
        create: `Pictograma no creado`,
        update: `Pictograma no actualizado`,
        delete: `Pictograma no fue eliminado`,
        pictogram_not_match: `El pictograma personalizado que intenta modificar no pertence al Paciente solicitante`,
        all: `Pictogramas no encontrados`,
      },
      not_found: `Pictograma no encontrado`,
      in_use: {
        name: `Nombre de pictograma ya está en uso`,
      },
    },
    success: {
      all: `Lista de Pictogramas`,
      found: `Pictograma encontrado`,
      create: `Pictograma creado`,
      update: `Pictograma actualizado`,
      delete: `Pictograma eliminado`,
    }
  },

  phase: {
    fields: {
      id: {
        required: `Identificador de la fase es requerido`,
        base: `Identificador de la fase debe ser un número válido`,
        positive: `Identificador de la fase debe ser un número positivo`
      },
      name: {
        base: `Nombre de la fase debe ser un texto válido`,
        min: `Nombre de la fase debe tener como minimo 3 caracteres`
      },
      description: {
        base: `Descripción de la fase debe ser un texto válido`,
        min: `Descripción de la fase debe tener como minimo 10 caracteres`
      },
      scoreActivities: {
        base: `Puntuación de actividades debe ser un número válido`,
        positive: `Puntuación de actividades debe ser un número positivo`,
        max: `La puntuación de actividades debe ser menor o igual a 20`
      }
    },
    errors: {
      controller: `Hubo un error en el controlador de fase`,
      service: {
        base: `Hubo un error en el servicio de fase`,
        create: `Fase no creada`,
        update: `Fase no actualizada`,
        delete: `Fase no fue eliminada`,
        all: `Fases no encontradas`,
      },
      helper: `Hubo un error en el helper del Expediente en donde se buscaba las fases`,
      not_found: `Fase no encontrada`,
      in_use: {
        name: `Nombre de fase ya está en uso`
      },
    },
    success: {
      all: `Lista de Fases`,
      found: `Fase encontrada`,
      create: `Fase creada`,
      update: `Fase actualizada`,
      delete: `Fase eliminada`,
    }
  },

  teaDegree: {
    fields: {
      id: {
        required: `Identificador del Grado de TEA es requerido`,
        base: `Identificador del Grado de TEA debe ser un número válido`,
        positive: `Identificador del Grado de TEA debe ser un número positivo`
      },
    },
    errors: {
      controller: `Hubo un error en el controlador de Grados de TEA`,
      service: {
        base: `Hubo un error en el servicio de Grados de TEA`,
        all: `Grados de TEA no encontrados`,
      },
      not_found: `Grado de TEA no encontrado`,
    },
    success: {
      all: `Lista de Grados de TEA`,
    }
  },

  healthRecord: {
    fields: {
      id: {
        required: `Identificador del Expediente es requerido`,
        base: `Identificador del Expediente debe ser un número válido`,
        positive: `Identificador del Expediente debe ser un número positivo`
      },
      description: {
        required: `Descripción es requerida`,
        base: `Descripción debe ser un texto válido`,
        empty: `Descripción no debe estar vacía`,
        min: `Descripción debe tener como minimo 3 caracteres`
      },
    },
    errors: {
      controller: `Hubo un error en el controlador del Expediente`,
      service: {
        base: `Hubo un error en el servicio del Expediente`,
        create: `Expediente no creado`,
        update: `Expediente no actualizado`,
        delete: `Expediente no fue eliminado`,
        all: `Expedientes no encontrados`,
      },
      not_found: `Expediente no encontrado`,
    },
    success: {
      all: `Lista de Expedientes`,
      found: `Expediente encontrado`,
      create: `Expediente creado`,
      update: `Expediente actualizado`,
    }
  },

  healthRecordPhase: {
    errors: {
      controller: `Hubo un error en el controlador de la relación Fase-expediente`,
      service: {
        base: `Hubo un error en el servicio de al momento de agregar la fase al expediente`,
        create: `Fase no pudo ser agregada al expediente`,
        update: `Fase no pudo ser actualizada al expediente`,
        all: `Las fases asociadas a este expediente no pudieron ser encontradas`,
      },
      already_exist: `La fase ya está asociada al Expediente`,
    },
    success: {
      all: `Lista de las fases del expediente`,
      create: `Fase fue agregada al expediente`,
      update: `Fase fue actualizada al expediente`,
    }
  },

  observations: {
    fields: {
      id: {
        required: `Identificador de la observación es requerido`,
        base: `Identificador de la observación debe ser un número válido`,
        positive: `Identificador de la observación debe ser un número positivo`
      },
      description: {
        required: `Descripción es requerida`,
        base: `Descripción debe ser un texto válido`,
        empty: `Descripción no debe estar vacía`,
        min: `Descripción debe tener como minimo 3 caracteres`
      },
    },
    errors: {
      controller: `Hubo un error en el controlador de observaciones`,
      service: {
        base: `Hubo un error en el servicio de observaciones`,
        create: `Observación no creada`,
        update: `Observación no actualizada`,
        delete: `Observación no fue eliminada`,
        all: `Observaciones no encontradas`,
      },
      not_found: `Observación no encontrada`,
    },
    success: {
      all: `Lista de Observaciones`,
      found: `Observación encontrada`,
      create: `Observación creada`,
      update: `Observación actualizada`,
    }
  },


  activity: {
    fields: {
      id: {
        required: `Identificador de la actividad es requerido`,
        base: `Identificador de la actividad debe ser un número válido`,
        positive: `Identificador de la actividad debe ser un número positivo`
      },
      name: {
        required: `Nombre de la actividad es requerido`,
        base: `Nombre de la actividad debe ser un texto válido`,
        empty: `Nombre de la actividad no debe estar vacío`,
        min: `Nombre de la actividad debe tener como mínimo 3 y como máximo 30 caracteres`,
        max: `Nombre de la actividad debe tener como máximo 30 caracteres`
      },
      description: {
        required: `Descripción de la actividad es requerido`,
        base: `Descripción de la actividad debe ser un texto válido`,
        empty: `Descripción de la actividad no debe estar vacío`,
        min: `Descripción de la actividad debe tener como mínimo 6 y como máximo 255 caracteres`,
        max: `Descripción de la actividad debe tener como mínimo 6 y como máximo 255 caracteres`
      },
      satisfactoryPoints: {
        required: `Puntuación de satisfacción es requerida`,
        base: `Puntuación de satisfacción debe ser un número válido`,
        positive: `Puntuación de satisfacción debe ser un número positivo`,
        max: `La puntuación de satisfacción debe ser menor o igual a 20`
      },
      pictogramSentence: {
        required: `Sentencia de pictograma es requerida`,
        base: `Los pictogramas deben ser válidos`,
        array_min: `La cantidad de pictogramas debe ser mayor o igual a 1`,
        number: `Los pictogramas deben ser números válidos`,
        positive: `Los pictogramas deben ser números positivos`,
        unique: `Los pictogramas deben ser únicos`,
      },
      satisfactorAttempts: {
        required: `La cantidad de intentos satisfactorios es requerida`,
        base: `La cantidad de intentos satisfactorios debe ser un número válido`,
        positive: `La cantidad de intentos satisfactorios debe ser un número positivo`,
      },
      restore: {
        required: `Se debe indicar si se desea restaurar la actividad`,
        base: `La condición de restauración debe ser un booleano válido`,
      }
    },
    errors: {
      controller: `Hubo un error en el controlador de actividades`,
      service: {
        base: `Hubo un error en el servicio de actividades`,
        create: `Actividad no creada`,
        update: `Actividad no actualizada`,
        delete: `Actividad no fue eliminada`,
        all: `Actividades no encontradas`,
        pictograms: `Los pictogramas seleccionados no son válidos`,
        unassign_activity_patient: `La actividad no pudo ser desasignada del paciente`,
        patient_activity_not_assigned: `La actividad seleccionada ya no está asignada al paciente`,
        patient_activity_not_found: `La actividad seleccionada no está asignada al paciente`,
        incorrect_answer: `Respuesta incorrecta`,
        check_attempt: `La respuesta que has enviado no pudo ser verificada`,
        delete_patient_activity: `La actividad no pudo ser eliminada del paciente`,
        already_completed: `La actividad ya fue completada`,
      },
      not_found: `Actividad no encontrada`,
      in_use: {
        name: `Nombre de actividad ya está en uso`,
        description: `La descripción de la actividad hace referencia a una actividad ya existente`,
        pictogramSentence: `La colección de pictogramas seleccionados hace referencia a una actividad ya existente`,
        activityPatient: `La actividad seleccionada ya fue asignada al paciente`,
        patient_activity_assigned: `El paciente ya tiene una actividad asignada`,
        patient_activity_unassigned: `La actividad seleccionada ya ha sido inhabilidata al paciente, ¿Desea volver a asignarla?`,
      },
    },
    success: {
      all: `Lista de Actividades`,
      found: `Actividad encontrada`,
      create: `Actividad creada`,
      update: `Actividad actualizada`,
      delete: `Actividad eliminada`,
      assigned: `Actividad asignada exitosamente`,
      unassigned: `Actividad desasignada exitosamente`,
      check_attempt: `Respuesta verificada exitosamente`,
      reassign: `Actividad reasignada exitosamente`,
    }
  },
}

module.exports = messages;