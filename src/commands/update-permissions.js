require('./command-line');
const { Permission } = require('@models/index');
const { actionMap, subjectMap, permissionsMatrix } = require('../config/permissions');



const buildPermissionsToUpdate = permissionsMatrix.reduce((acc, current) => {

  const permissionsPerSubject = current.actions.reduce((acc1, current1) => [
    ...acc1,
    {
      name: `${actionMap[current1]} ${subjectMap[current.subject]}`,
      group: !('group' in current) ? current.subject : current.group,
      code: `${current1}-${current.subject}`
    }
  ],[]);

  return [
    ...acc,
    ...permissionsPerSubject
  ];
},[]);

// create permissions
/* eslint-disable no-restricted-syntax */
for(const item of buildPermissionsToUpdate) {
  Permission.findOne({
    where: {
      code: item.code
    },
  }).then((exist) => {
    if(!exist) {
      Permission.create({
        name: item.name,
        group: item.group,
        code: item.code
      });
    }
  });
}
