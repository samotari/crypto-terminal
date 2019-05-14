var manager = require('./manager');

before(function(done) {
	this.timeout(12000);
	manager.prepareBrowser(done);
});

var staticWeb;
before(function(done) {
	staticWeb = manager.prepareStaticWebServer(done);
});

after(function(done) {
	if (!staticWeb) return done();
	staticWeb.server.close(done);
});

after(function(done) {
	if (!manager.page) return done();
	manager.page.close().then(function() {
		done();
	}).catch(done);
});

after(function(done) {
	this.timeout(12000);
	if (!manager.browser) return done();
	manager.browser.close().then(function() {
		done();
	}).catch(done);
});
