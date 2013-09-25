var trivial = require('./trivial');

exports.test_trivial_theAnswer_empty = function(test){
	test.expect(1);
	test.equal(trivial.theAnswer(), 42, 'The answer should be 42.');
	test.done();
};

exports.test_trivial_theAnswer_LTUAE = function(test){
	test.expect(1);
	var theAnswer = trivial.theAnswer('Life, the universe and everything.');
	test.equal(theAnswer, 42, 'The answer should be 42.');
	test.done();
};
