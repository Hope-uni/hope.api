const { permissionsMatrix } = require('@config/permissions');


const permissionsConstants = permissionsMatrix.reduce((acc, { subject, actions }) => {
  actions.forEach((action) => {
    const key = `${action.toUpperCase()}_${subject.toUpperCase().replace(/-/g, '_')}`;
    acc[key] = `${action}-${subject}`
  });
  return acc
}, {});

module.exports = permissionsConstants;
