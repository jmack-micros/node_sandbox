//
// Some defaults - put these in a config file perhaps?
var iterations = 10;
var keyLength = 512;

//
// require()s...
var redis = require('redis');
var crypto = require('crypto');

//
// Checks if a user exists already in redis.
function userExists(client, username, callback) {
	client.exists(createUserKey(username), function(err, obj) {
		if(err) {
			callback(err, null);
			return;
		}
		if(obj === 1) {
			callback(null, true);
		} else {
			callback(null, false);
		}
	});
}

//
// Stores a user in redis
function putUserIntoStore(client, username, credentials, callback) {
	client.hmset(createUserKey(username), 
		"username", username, 
		'hashed.password', credentials.derivedKey, 
		"salt", credentials.salt,
		function (err, obj) {
			if(err) {
				callback(err);
				return;
			}
			callback(null);
		});
}

//
// Checks redis to see if a user is authorized
function isAuthorised(client, username, password, callback) {
	//find user in redis; if not there callback(err, null);
	client.hgetall(createUserKey(username), function (err, obj) {
		if(err) {
			callback(err, false);
			return;
		}
		compareHashes(password, obj, function(err, isauth) {
			if(err) {
				callback(err, false); 
				return;
			}
			callback(null, isauth);
		});
	});
}

//
// Generates a hash from the password and stored salt. Comapres it to the stored hash.
function compareHashes(suppliedPassword, redishash, callback) {
	crypto.pbkdf2(suppliedPassword, redishash['salt'], iterations, keyLength, function (err, derivedKey) {
		if(err) {
			callback(err, null);
			return;
		}
		var hashesMatch = redishash['hashed.password'] === derivedKey.toString('base64');
		callback(null, hashesMatch);
	});
}

//
// Creates a salted hash of a plaintext password
function createSaltedHash(plaintextPassword, callback) {
	var salt = crypto.randomBytes(128).toString('base64');
	crypto.pbkdf2(plaintextPassword, salt, iterations, keyLength, function(err, derivedKey) {
		if(err) {
			callback(err, null);
			return;
		}
		callback(null, {salt: salt, derivedKey: derivedKey.toString('base64')});
	});
}

//
// Returns a key for use in redis.
function createUserKey(username) {
	return "username:" + username;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  Functions assigned to exports
//

//
// Checks a user's username and password against redis. 401 if no creds sent in request. 403 if not authenticated.
function checkCredentials() {

	return function (req, res, next) {
		
		if(!req.authorization.basic) {
			res.setHeader('WWW-Authenticate', 'Basic');
			res.send(401);
			return next();
		}

		var username = req.authorization.basic.username;
		var password = req.authorization.basic.password;
		var client = redis.createClient();

		isAuthorised(client, username, password, function (err, authorized) {
			if(err || !authorized) {
				client.quit();
				return next(new restify.NotAuthorizedError('Invalid credentials.'));		
			}
			client.quit();
			return next();
		});
	}
}

//
// Creates a user in redis. Hashes and salts their password.
function createUser(username, password, callback) {
	var client = redis.createClient();
	//check if exists
	userExists(client, username, function (err, exists) {
		if(err) {
			client.quit();
			callback(err, null);
			return;
		}
		if(exists) {
			client.quit();
			callback(null, {success: false, errorText: "Username already exists."});
			return;
		}
		// create their credentials
		createSaltedHash(password, function (err, credentials) {
			if(err) {
				client.quit();
				callback(err, null);
				return;
			}
			// store in redis
			putUserIntoStore(client, username, credentials, function (err) {
				if(err) {
					client.quit();
					callback(err, null);
					return;
				}
				client.quit();
				callback(null, {success: true});
			});
		});
	});
}

//
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//
// Export these things:
exports.checkCredentials = checkCredentials;
exports.createUser = createUser;
