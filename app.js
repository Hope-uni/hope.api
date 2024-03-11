require('module-alias/register');
const express = require('express');
const cors = require('cors');
const dotEnv = require('dotenv');

const logger = require('./src/config/logger.config');


dotEnv.config();
const app = express();
const port = process.env.PORT || 3000;


// Importations
const routes = require('./src/routes');

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.use('/api', routes);

// Run Server
app.listen(port, () => {
  logger.info(`Server running on Port: ${port}`);
});