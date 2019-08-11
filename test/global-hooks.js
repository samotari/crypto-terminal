var manager = require('./manager');

before(function(done) {
	manager.prepareBrowser(function(error) {
		if (error) return done(error);
		done();
	});
});

var staticWeb;
before(function(done) {
	staticWeb = manager.prepareStaticWebServer(done);
});

after(function(done) {
	if (!manager.browser) return done();
	manager.browser.close().then(function() {
		done();
	}).catch(done);
});

after(function(done) {
	if (!staticWeb) return done();
	// NOTE:
	// This will be slow if there are still clients connected to the web server.
	// Close any active clients first.
	staticWeb.server.close(done);
});

process.on('SIGINT', function() {
	if (manager.browser) {
		var child = manager.browser.process();
		child.kill();
	}
});
