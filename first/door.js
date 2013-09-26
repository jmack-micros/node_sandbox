var util = require('util');
var events = require('events');
var logger = require('./logger.js');


(function(exports){

	exports.Door = function Door(colour) {

		events.EventEmitter.call(this);

		this.colour = colour;
		this.state = "closed";

		var self = this;

		var logEvent = function() {
			return function() {
				logger.info({colour: self.colour, state: self.state}, "Door says");
			};
		}();

		var logListener = function(){
			return function(eventName){
				logger.info({colour: self.colour, eventNamed: eventName}, "Door says");
			};
		}();
		
		this.open = function() {
			this.state = "open";
			this.emit('open');
		};

		this.close = function() {
			this.state = 'closed';
			this.emit('close');
		};

		this.on('open', function(stream) {
			logEvent();
		});

		this.on('close', function(stream) {
			logEvent();
		});

		this.on('newListener', function(stream) {
			logListener('new listener');
		});

		this.on('removeListener', function(stream) {
			logListener('removed listener');
		});

	};

	util.inherits(exports.Door, events.EventEmitter);

})(exports);
