const { createLogger, format, transports } = require('winston');

const {
  combine,
  timestamp,
  printf,
} = format;
require('winston-daily-rotate-file');


// DailyRotateFile
const fileRotateTransport = new transports.DailyRotateFile({
  level: 'error',
  filename: `${__dirname}/../logs/error-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '2d',
  maxFiles: '20m',
});


// Custom Format
/* eslint-disable no-shadow */
const customFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

const logger = createLogger({
  level: 'debug',
  transports: [
    new transports.Console(),
    fileRotateTransport,
  ],
  format: combine(
    timestamp(),
    customFormat,
  ),
});


module.exports = logger;