const actionMap = {
  "add": "Agregar",
  "assign": "Asignar",
  "change": "Cambiar",
  "create": "Crear",
  "delete": "Eliminar",
  "search": "Buscar",
  "get": "Get",
  "list": "Listar",
  "unassign": "Unassign",
  "update": "Actualizar",
  "verify": "Verify",
  "advance": "Advance"
};

const subjectMap = {
  "observation": "observación",
  "activity": "actividad",
  "password-assigned-patient": "contraseña de paciente asignado",
  "category": "categoría",
  "custom-pictogram": "pictograma personalizado",
  "patient": "paciente",
  "pictogram": "pictograma",
  "role": "rol",
  "therapist": "terapeuta",
  "tutor": "tutor",
  "user": "usuario",
  "profile": "perfil",
  "assigned-patient": "paciente asignado",
  "phase": "fase",
  "tea-degree": "grado TEA",
  "activity-answer": "respuesta de actividad",
  "achievement": "logro",
  "monochrome": "monocromo",
};

const permissionsMatrix = [
  {
    "subject": "achievement",
    "actions": [
      "assign",
      "create",
      "delete",
      "get",
      "list",
      "search",
      "unassign",
      "update",
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
    "subject": "monochrome",
    "group": "healthRecord",
    "actions": [
      "change",
    ]
  },
  {
    "subject": "observation",
    "actions": [
      "add"
    ]
  },
  {
    "subject": "password-assigned-patient",
    "group": "patient",
    "actions": [
      "change",
    ],
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
      "advance",
      "list",
      "update",
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
    "subject": "therapist",
    "group": "patient",
    "actions": [
	    "assign",
	    "change",
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
  },
];


module.exports = {
  actionMap,
  subjectMap,
  permissionsMatrix
}
