require('module-alias/register');
const express = require('express');
const cors = require('cors');
const dotEnv = require('dotenv');
const logger = require('./src/config/logger.config');


dotEnv.config();
const app = express();
const port = process.env.PORT || 3000;


// Importations

// Middlewares
app.use(express.json());
app.use(cors());


// Routes

// Run Server
app.listen(port, () => {
  logger.info(`Server running on Port: ${port}`);
});