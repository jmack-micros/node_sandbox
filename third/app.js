var restify = require('restify');
var fs = require('fs');
var logger = require('./lib/logger.js');
var _ = require('underscore');

//
// Set up server with SSL
//
// Note: Setting the "key" and "certificate" options here enables https.
var server = restify.createServer({
	name: 'third',
	key: fs.readFileSync('./keys/julianmack.dev.key'),
	certificate: fs.readFileSync('./keys/julianmack.dev.pem'),
	log: logger
});

server
	.use(restify.fullResponse())
	.use(restify.bodyParser())
	.use(restify.queryParser());

//set Connection: close header workaround for curl
server
	.pre(restify.pre.userAgentConnection());

//
// Routes
//
server.get('/', function(req, res, next) {
	res.send({greeting: "Hello world."});
	return next();
});

//
// Start server
//
server.listen(3003, function() {
	console.log('node.js server %s listening at %s', server.name, server.url);
});
