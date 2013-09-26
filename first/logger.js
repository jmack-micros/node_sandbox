var bunyan = require('bunyan');
var loggerOptions = require('./config/logger-options.json');

loggerOptions.serializers = {
	req: bunyan.stdSerializers.req,
	res: bunyan.stdSerializers.res
};

module.exports = bunyan.createLogger(loggerOptions);
