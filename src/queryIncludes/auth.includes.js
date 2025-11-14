const {
    UserRoles,
    Role,
    Permission,
} = require('@models/index');

const userLoginIncludes = () => {
    return [
        {
            model: UserRoles,
            include: [
                {
                    model: Role,
                    include: [
                        {
                            model: Permission,
                            as: 'permissions'
                        }
                    ]
                }
            ]
        }
    ];
}


const meIncludes = () => {
    return [
        {
            model: UserRoles,
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'roleId', 'id']
            },
            include: [
                {
                    model: Role,
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'status']
                    },
                    include: {
                        model: Permission,
                        as: 'permissions',
                        attributes: {
                            exclude: ['group', 'createdAt', 'updatedAt', 'status']
                        },
                        through: {
                            attributes: {
                                exclude: [
                                    'id',
                                    'createdAt',
                                    'updatedAt',
                                    'roleId',
                                    'permissionId',
                                ]
                            }
                        }
                    }
                }
            ]
        }
    ];
}


module.exports = {
    userLoginIncludes,
    meIncludes
}