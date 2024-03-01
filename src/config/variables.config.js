const path = require('path');
const dotenv = require('dotenv');


dotenv.config({ path: path.join(__dirname, '../../.env')});

module.exports = {

  // Database 
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  ssl: process.env.DB_SSL === 'true',

}