const {
  database,
  dialect,
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
    dialect,
    ssl
  },
  test: {
    username: user,
    password,
    database,
    host,
    dialect,
  },
  production: {
    username: user,
    password,
    database,
    host,
    dialect,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  },

}
