'use strict';

var manager = require('../manager');

before(function(done) {
	manager.preparePage(done);
});

before(function(done) {
	manager.navigate('/', done);
});
