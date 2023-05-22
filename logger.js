const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs.log' })
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'error.log' })
  ],
});

module.exports = logger;
