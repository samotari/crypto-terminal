var puppeteer = require('puppeteer');
var connect = require('./../../grunt/connect');
var manager = {};

var opts = {
  headless: true,
  slowMo: 100,
  timeout: 10000
};

before(function (done) {
	puppeteer
	.launch(opts)
	.then(function (browser) {
		manager.browser = browser;
		browser.newPage()
		.then(function(newPage) {
			newPage.goto('http://' + connect.test.options.hostname + ':' + connect.test.options.port + '/')
			.then(function() {
				manager.page = newPage;
				done();
			})
		})
	});
});

after (function () {
	manager.browser.close();;
});

module.exports = manager;
