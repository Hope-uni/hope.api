const actionMap = {
  "update": "Actualizar",
  "delete": "Eliminar",
  "search": "Buscar",
  "create": "Crear",
  "list": "Listar",
  "view": "Ver",
  "add": "Agregar",
  "assign": "Asignar",
  "unassign": "Desasignar",
  "access": "Acceder",
  "get": "Obtener",
  "change-password": "Cambiar contraseña",
  "verify": "Verificar",
  "advance": "Avanzar"
};

const subjectMap = {
  "role": "rol",
  "user": "usuario",
  "therapist": "terapeuta",
  "tutor": "tutor",
  "patient": "paciente",
  "profile": "perfil",
  "category": "categoría",
  "pictogram": "pictograma",
  "custom-pictogram": "pictograma personalizado",
  "phase": "fase",
  "assigned-patient": "paciente asignado",
  "observation": "observación",
  "activity": "actividad",
  "communication-board": "tablero de comunicación",
  "tea-degree": "grado TEA",
  "activity-answer": "respuesta de actividad",
  "achievement": "logro"
};

const permissionsMatrix = [
  {
    "subject": "achievement",
    "actions": [
      "assign",
      "unassign",
      "get",
      "create",
      "delete",
      "list",
      "search",
      "update"
    ]
  },
  {
    "subject": "activity",
    "actions": [
      "assign",
      "create",
      "delete",
      "get",
      "list",
      "search",
      "unassign"
    ]
  },
  {
    "subject": "activity-answer",
    "group": "activity",
    "actions": [
      "verify"
    ],
  },
  {
    "subject": "assigned-patient",
    "group": "patient",
    "actions": [
      "change-password",
      "get",
      "list"
    ],
  },
  {
    "subject": "category",
    "actions": [
      "create",
      "delete",
      "get",
      "list",
      "search",
      "update"
    ]
  },
  {
    "subject": "custom-pictogram",
    "group": "customPictogram",
    "actions": [
      "create",
      "delete",
      "get",
      "list",
      "update"
    ],
  },
  {
    "subject": "observation",
    "actions": [
      "add"
    ]
  },
  {
    "subject": "patient",
    "actions": [
      "create",
      "delete",
      "get",
      "list",
      "search",
      "update"
    ]
  },
  {
    "subject": "phase",
    "actions": [
      "list",
      "update",
      "advance"
    ]
  },
  {
    "subject": "pictogram",
    "actions": [
      "create",
      "delete",
      "get",
      "list",
      "search",
      "update"
    ]
  },
  {
    "subject": "profile",
    "actions": [
      "get",
      "update"
    ]
  },
  {
    "subject": "role",
    "actions": [
      "create",
      "delete",
      "get",
      "list",
      "search",
      "update"
    ]
  },
  {
    "subject": "tea-degree",
    "group": "teaDegree",
    "actions": [
      "list"
    ],
  },
  {
    "subject": "therapist",
    "actions": [
      "create",
      "delete",
      "get",
      "list",
      "search",
      "update"
    ]
  },
  {
    "subject": "tutor",
    "actions": [
      "create",
      "delete",
      "get",
      "list",
      "search",
      "update"
    ]
  },
  {
    "subject": "user",
    "actions": [
      "create",
      "delete",
      "get",
      "list",
      "search",
      "update"
    ]
  }
];



module.exports = {
  actionMap,
  subjectMap,
  permissionsMatrix
}
