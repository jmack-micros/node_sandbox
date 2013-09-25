var restify = require('restify');
var door = require('./door.js');

var Logger = require('bunyan');
var log = new Logger({
	name: "first",
	streams: [
		// {
		// 	stream: process.stdout,
		// 	level: 'debug'
		// },
		{
			path: "./logs/first.info.log",
			level: "info"
		},
		{
			path: "./logs/first.error.log",
			level: "error"
		}
	],
	serializers: {
		req: Logger.stdSerializers.req,
		res: Logger.stdSerializers.res
	}
});

var server = restify.createServer({
	name: 'first',
	log: log
});

server
	.use(restify.fullResponse())
	.use(restify.bodyParser())
	.use(restify.queryParser());

//set Connection: close header for curl
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


// a container for some doors
var doors = {};

//
// Helper functions for doors
//
function createDoor(colour) {
	var retval = new door.Door(colour);
	retval.domain = null;
	return retval;
}

function setCloseHandler(doorInstance) {
	doorInstance.once('close', function(stream) {
		console.log('Server says: The %s door was closed.', this.colour);
		setOpenHandler(this);
	});
}

function setOpenHandler(doorInstance) {
	doorInstance.once('open', function(stream) {
		console.log('Server says: The %s door was opened.', this.colour);
		setCloseHandler(this);
	});
}

//
// Routes
//
server.get('/doors', function(req, res, next) {
	res.send(doors);
	return next(); 
});

server.get('/door/:colour', function(req, res, next) {
	var door = doors[req.params.colour];
	if(door !== undefined) {
		res.send(door);
	} else {
		res.send(404);
	}
	return next();
});

server.put('/door/:colour', function(req, res, next) {
	doors[req.params.colour] = createDoor(req.params.colour);

	//add event listener for first opening only of the door
	setOpenHandler(doors[req.params.colour]);

	res.send(204);
	return next();
});

server.post('/door', function(req, res, next){
	if(req.params.colour === undefined){
		return next(new restify.InvalidArgumentError('colour must be specified.'));
	}
	var newDoor = createDoor(req.params.colour);
	doors[req.params.colour] = newDoor;
	res.send(newDoor);
	return next();
});

server.put('/door/:colour/open', function(req, res, next) {
	var door = doors[req.params.colour];
	if(door !== undefined) {
		doors[req.params.colour].open();
		res.send(204);
	} else {
		res.send(404);
	}
	return next();
});

server.put('/door/:colour/close', function(req, res, next) {
	var door = doors[req.params.colour];
	if(door !== undefined){
		door.close();
		res.send(204);
	} else {
		res.send(404);
	}
	return next();
});

//
// Start server
//
server.listen(3000, function(){
	console.log('node.js server %s listening at %s', server.name, server.url);
});
