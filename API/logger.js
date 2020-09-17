const winston = require("winston");

const {  format } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `{"level":"${level}", "timestamp":"${timestamp}", "message":"${message}"}`;
});

const level = process.env.LOG_LEVEL || 'debug';

const logger = new winston.createLogger({
    format: combine(
        timestamp(),
        myFormat
      ),
    transports: [
        new winston.transports.File({ filename: 'log/error.log', level: 'error'}),
        new winston.transports.File({ filename: 'log/info.log', level: 'info' }),
    new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
          myFormat
        )
      })
    ],
    exceptionHandlers: [
      new winston.transports.File({ filename: 'log/exceptions.log' })
    ]
});

module.exports = logger