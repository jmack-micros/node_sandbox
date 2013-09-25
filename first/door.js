var util = require('util');
var events = require('events');

(function(exports){

	var eventEmitter = new events.EventEmitter();

	exports.Door = function Door(hue) {

		events.EventEmitter.call(this);

		this.colour = hue;
		this.state = "closed";

		var self = this;

		var logEvent = function() {
			return function() {
				console.log('Door says: The %s door is now %s.', self.colour, self.state);
			};
		}();

		var logListener = function(){
			return function(eventName){
				console.log('Door says: the %s door has a %s', self.colour, eventName);
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
			console.log(util.inspect(this.listeners('open')));
		});

		this.on('removeListener', function(stream) {
			logListener('removed listener');
		});

	};

	util.inherits(exports.Door, events.EventEmitter);

})(exports);
