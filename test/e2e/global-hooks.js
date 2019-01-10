var manager = require('../manager');
require('../global-hooks');

before(function(done) {
	manager.preparePage(done);
});
