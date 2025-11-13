const {
    User,
    Pictogram,
    Category,
} = require('@models/index');

const patientCustomPictogramsIncludes = (whereCondition = {}) => {
    return [
        {
            model: User,
            where: {
                status: true,
                ...whereCondition
            },
        }
    ];
}

const baseCustomPictogramsIncludes = () => {
    return [
        {
            model: Pictogram,
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'status']
            },
            include: {
                model: Category,
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'status']
                },
            }
        }
    ];
}

const allPictogramsIncludes = () => {
    return [
        {
            model: Category,
            where: {
                status: true,
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'status']
            }
        }
    ];
}


module.exports = {
    patientCustomPictogramsIncludes,
    baseCustomPictogramsIncludes,
    allPictogramsIncludes
}