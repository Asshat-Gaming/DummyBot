'use strict';

const { createLogger, transports } = require('winston');

const logger = createLogger({
  level: process.env.LOGGING_LEVEL || 'info',
  transports: [
    new transports.Console(),
  ],
});

module.exports = logger;