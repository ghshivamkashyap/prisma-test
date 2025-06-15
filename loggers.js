// This file demonstrates basic usage of Winston, Pino, Bunyan, Loglevel, and Npmlog
const winston = require('winston');
const pino = require('pino');
const bunyan = require('bunyan');
const log = require('loglevel');
const npmlog = require('npmlog');

// Winston setup
const winstonLogger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console()
  ]
});

// Pino setup
const pinoLogger = pino();

// Bunyan setup
const bunyanLogger = bunyan.createLogger({ name: 'bunyanLogger' });

// Loglevel setup
log.setLevel('info');

// Npmlog setup
npmlog.level = 'info';

function logAll(message) {
  winstonLogger.info('Winston: ' + message);
  pinoLogger.info('Pino: ' + message);
  bunyanLogger.info('Bunyan: ' + message);
  log.info('Loglevel: ' + message);
  npmlog.info('Npmlog', message);
}

module.exports = { logAll };
