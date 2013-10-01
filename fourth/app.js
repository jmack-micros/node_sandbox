"use strict";
var async = require('async');
var restify = require('restify');
var _ = require('underscore');

//var delayServer = require('./lib/delay-server.js');

var callDelay = require('./lib/delay-server.js').callDelay;


function sendResponse(err, data, req, res, next) {
	if(err) {
		return next(err);
	}
	res.send(data);
	return next();
}


var server = restify.createServer({
	name: "fourth"
});

server
	.use(restify.fullResponse())
	.use(restify.bodyParser())
	.use(restify.queryParser());

//set Connection: close header workaround for curl
server
	.pre(restify.pre.userAgentConnection());


server.get('/', function(req, res, next) {

	var message = { res: {} };

	callDelay('42', function(error, request, response, data) {
		message.res = data;
		res.send(message);
		return next();
	});
});

server.get('/series/:firstDelay/:secondDelay', function(req, res, next) {
	var message = [];
	async.series([
		// first function call in the series
		function (callback) {
			callDelay(req.params.firstDelay, function(error, request, response, data) {
				if(error) {
					callback(error);
					return;
				}
				message.push(data);
				callback();
			});
		},
		// second function call
		function (callback) {
			callDelay(req.params.secondDelay, function(error, request, response, data) {
				if(error) {
					callback(error);
					return;
				}
				message.push(data);
				callback();
			});
		}], 
		function(err) {
			sendResponse(err, message, req, res, next);
		}
	);
});

server.get('/parallel/:firstDelay/:secondDelay', function(req, res, next) {
	async.parallel(
		[
			function (callback) {
				callDelay(req.params.firstDelay, function(error, request, response, data) {
					// not using an closure, but using optional form of callback()...
					callback(null, data);
				});
			},
			function (callback) {
				callDelay(req.params.secondDelay, function(error, request, response, data) {
					callback(null, data);
				});				
			}
		],
		function (err, results) {
			// in this form of the callback using the optional results parameter :)
			if(err) {
				return next(err);
			}
			res.send(results);
			return next();
		}
	);
});

server.get('/each/:delays', function (req, res, next) {
	var delays = req.params.delays.split('-');
	var message = [];

	async.each(delays, function (delay, callback) {
		callDelay(delay, function (error, request, response, data) {
			if (error) {
				callback(error);
				return;
			}
			message.push(data);
			callback();
		});
	}, function (err) {
		if(err) {
			return next(err);
		}
		res.send(message);
		return next();
	});
});

server.get('eachlimit/:limit/:delays', function (req, res, next) {
	var limit = req.params.limit;
	var delays = req.params.delays.split('-');
	var message = [];

	async.eachLimit(delays, limit, function (delay, callback) {
		callDelay(delay, function (err, req, res, data) {
			if(err) {
				callback(err);
				return;
			}
			message.push(data);
			callback();
		});

	}, function (err) {
		if(err) {
			return next(err);
		}
		res.send(message);
		return next();
	});
});

server.get('eachseries/:delays', function (req, res, next) {
	var delays = req.params.delays.split('-');
	var message = [];

	async.eachSeries(delays, function (delay, callback){
		callDelay(delay, function (err, req, res, data) {
			if(err) {
				callback(err);
				return;
			}
			message.push(data);
			callback();
		});
	}, 
	function(err) {
		sendResponse(err, message, req, res, next);
	});

});




//
// Start server
//
server.listen(3004, function() {
	console.log("Server %s listening on %s.", server.name, server.url);
});
