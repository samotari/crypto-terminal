var manager = require('../manager');
require('../global-hooks');

before(function(done) {
	manager.preparePage(done);
});

before(function(done) {
	manager.page.setViewport({
		width: 375,
		height: 667,
	}).then(function() {
		done();
	}).catch(done);
});
