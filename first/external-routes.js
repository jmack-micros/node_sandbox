(function(exports){
	exports.setup = function(server) {
		server.get('/external', function(req, res, next){
			res.send({external : true});
			return next();
		});
	};
})(exports);
