var restify = require('restify');
var fs = require('fs');
var membership = require('./lib/redis-membership.js');
var salter = require('./lib/salter.js');

var server = restify.createServer({
	name: "basicauth",
	key: fs.readFileSync('./keys/julianmack.dev.key'),
	certificate: fs.readFileSync('./keys/julianmack.dev.pem')
});

//
// MIDDLEWARE
//
server
	.use(restify.fullResponse())
	.use(restify.bodyParser())
	.use(restify.queryParser())
	.use(restify.authorizationParser())
	.use(membership.checkCredentials());

//set Connection: close header workaround for curl
server
	.pre(restify.pre.userAgentConnection());

//
// ROUTES
//
server.get('/', function (req, res, next) {
	res.send(200);
	return next();
});

server.get('/banana', function (req, res, next) {
	res.send(200, {fruit: "banana"});
	return next();
});

server.post('/user/create', function (req, res, next) {
	var username = req.params.username;
	var password = req.params.password;

	membership.createUser(username, password, function (err, result) {
		if(err) {
			return next(err);
		}
		res.send(result);
		return next();
	});
});

//
// Start server
//
server.listen(3006, function () {
	console.log('node.js server %s listening at %s', server.name, server.url);
});
