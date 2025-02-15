const path = require('path');
const dotenv = require('dotenv');


dotenv.config({ path: path.join(__dirname, '../../.env')});

module.exports = {

  // secret Key
  secretKey: process.env.SECRET_KEY,

  // Database Variables
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  ssl: process.env.DB_SSL === 'true',

  // User Variables
  userCode: process.env.USER_CODE,

  // Email Variables
  userEmail:process.env.EMAIL_ADDRESS,
  passwordEmail: process.env.EMAIL_PASSWORD,
  emailPort: process.env.EMAIL_PORT,
  emailHost: process.env.EMAIL_HOST,
  domain: process.env.EMAIL_DOMAIN,
  emailSecure: process.env.EMAIL_SECURE,

  // Token Variables
  jwtAccessExpiration: process.env.JWT_ACCESS_EXPIRATION,

  // Roles
  isAdmin: process.env.IS_ADMIN,
  isTutor: process.env.IS_TUTOR,
  isTherapist: process.env.IS_THERAPIST,
}