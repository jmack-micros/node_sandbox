var restify = require('restify');

var url = "http://localhost:3001";
var path = "/delay/";

var jsonClient = restify.createJsonClient({
		url: url,
		version: '*'
	});

module.exports.callDelay = function(timeout, callback) {
	var requestPath = path + timeout;
	jsonClient.get(requestPath, callback);
};
