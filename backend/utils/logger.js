const winston = require('winston');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

// Format personnalisé pour les logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${stack ? '\n' + stack : ''}`;
  })
);

const logger = winston.createLogger({
  level: env === 'production' ? 'info' : 'debug',
  format: customFormat,
  transports: [
    // Logs dans la console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      ),
    }),
    // Logs dans un fichier
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

module.exports = logger;