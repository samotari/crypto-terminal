'use strict';

var manager = require('../manager');
require('../global-hooks');

before(function(done) {
	manager.preparePage(done);
});

before(function(done) {
	manager.navigate('/', done);
});
