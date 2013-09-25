var restify = require('restify');
var bunyan = require('bunyan');
var log = bunyan.createLogger({
	name: "second",
	streams: [
		// {
		// 	stream: process.stdout,
		// 	level: 'debug'
		// },
		{
			path: "./logs/second.info.log",
			level: "info"
		},
		{
			path: "./logs/second.error.log",
			level: "error"
		}
	],
	serializers: {
		req: bunyan.stdSerializers.req,
		res: bunyan.stdSerializers.res
	}
});

var server = restify.createServer({
	name: 'second',
	log: log
});

server
	.use(restify.fullResponse())
	.use(restify.bodyParser())
	.use(restify.queryParser());

//set Connection: close header workaround for curl
server
	.pre(restify.pre.userAgentConnection());

//
// Logging
//
server.pre(function(req, res, next){
	req.log.info({req: req}, 'start');
	return next();
});

server.on('after', function(req, res, route) {
	req.log.info({res: res}, 'finished');
});


//
// Routing
//
server.get('/', function(req, res, next) {
	res.send({ waitedFor: 0 });
	return next();
});

server.get('/delay/:timeOut', function(req, res, next) {
	var timeout = req.params.timeOut;
	if(isNaN(timeout) || timeout < 0){
		return next(new restify.InvalidArgumentError('timeOut must be a non-negative number.'));
	}
	setTimeout(function() {
		res.send({ waitedFor: timeout });
		return next();
	}, timeout);
});


//
// Start server
//
server.listen(3001, function(){
	console.log('node.js server %s listening at %s', server.name, server.url);
});
