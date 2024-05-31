require('./command-line');
const { Permission } = require('@models/index');

const modules = {
  role: "roles",
  user: "usuarios",
  therapist: "terapeutas",
  tutor: "tutores",
  patient: "pacientes",
  profile: "perfil",
  category: "categorias",
  pictogram: "pictogramas"
}

const permission = {
  create: "crear",
  read: "listar",
  update: "actualizar",
  delete: "borrar",
  find: "buscar",
}


const dataToUpdate = Object.keys(modules).reduce(
  (acc, curr) => ({
      ...acc,
      [curr]: Object.keys(permission).reduce(
          (acc2, curr2) => ([
              ...acc2, `${permission[curr2]} ${modules[curr]}`
          ]),
          []
      )
  }),
  {}
)

Object.keys(dataToUpdate).forEach((group) => {
  dataToUpdate[group].forEach((per) => {
    Permission.findOne({ where: { description: per } }).then((exists) => {
      if (!exists) {
        Permission.create({ description: per, group });
      }
    });
  });
});

// Custom Permissions
const customPermissions = [
  {
    description: 'buscarme',
    group: ' '
  },
  {
    description: 'update-patient-therapist',
    group: 'therapist'
  },
  {
    description: 'update-patient-tutor',
    group: 'tutor'
  },
]

/* eslint-disable no-restricted-syntax */
for (const iterator of customPermissions) {
  Permission.findOne({ where: { description: iterator.description } }).then((exists) => {
    if (!exists) {
      Permission.create({ description: iterator.description, group: iterator.group });
    }
  });
}
