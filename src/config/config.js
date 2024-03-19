const {
  database,
 // dialect,
  host,
  password,
  user,
  ssl
} = require('./variables.config');


module.exports = {
  development: {
    username: user,
    password,
    database,
    host,
    dialect: 'postgres',
    ssl
  },
  test: {
    username: user,
    password,
    database,
    host,
    dialect: 'postgres',
  },
  production: {
    username: user,
    password,
    database,
    host,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  },

}
