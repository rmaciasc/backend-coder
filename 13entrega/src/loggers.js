// Logger
const log4js = require('log4js');

log4js.configure({
  appenders: {
    logConsole: { type: 'console' },
    warnFile: { type: 'file', filename: 'logs/warn.log' },
    errorFile: { type: 'file', filename: 'logs/error.log' },
  },
  categories: {
    default: { appenders: ['logConsole'], level: 'info' },
    fileWarn: { appenders: ['warnFile'], level: 'warn' },
    fileError: { appenders: ['errorFile'], level: 'error' },
  },
});

const loggerConsola = log4js.getLogger();
const loggerWarn = log4js.getLogger('fileWarn');
const loggerError = log4js.getLogger('fileError');

module.exports = { loggerConsola, loggerError, loggerWarn };
