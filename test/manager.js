'use strict';

var _ = require('underscore');

process.env = _.defaults(process.env || {}, {
	NODE_ENV: 'test',
	TARGET: 'test',
});

var express = require('express');
var puppeteer = require('puppeteer');
var Primus = require('primus');
var serveStatic = require('serve-static');

var manager = module.exports = {

	browser: null,
	page: null,

	prepareStaticWebServer: function(done) {

		var app = express();
		app.use(serveStatic('www'));
		app.server = app.listen(3000, done);
		return app;
	},

	prepareBrowser: function(options, done) {

		if (_.isFunction(options)) {
			done = options;
			options = null;
		}

		options = _.defaults({}, options || {}, {
			headless: true,
			slowMo: 0,
			timeout: 10000
		});

		/*
			See:
			https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-on-travis-ci
		*/
		if (process.env.TRAVIS_CI) {
			options.args = ['--no-sandbox'];
		}

		puppeteer.launch(options).then(function(browser) {
			manager.browser = browser;
			done(null, browser);
		}).catch(done);
	},

	navigate: function(uri, done) {

		if (!manager.page) {
			return done(new Error('Must load a page before navigating.'));
		}

		var host = process.env.HTTP_SERVER_HOST || 'localhost';
		var port = parseInt(process.env.HTTP_SERVER_PORT || 3000);
		var baseUrl = 'http://' + host + ':' + port;
		var pageUrl = baseUrl + uri;
		manager.page.goto(pageUrl).then(function() {
			done();
		}).catch(done);
	},

	preparePage: function(done) {

		if (!manager.browser) {
			return done(new Error('Must prepare browser before opening a page.'));
		}

		manager.browser.newPage().then(function(newPage) {
			manager.page = newPage;
			done(null, newPage);
		}).catch(done);
	},

	evaluateInPageContext: function(fn, done) {

		manager.page.evaluate(fn).then(function() {
			var args = Array.prototype.slice.call(arguments);
			done.apply(undefined, [null].concat(args));
		}).catch(done);
	},

	onAppLoaded: function(done) {

		done = _.once(done);
		manager.navigate('/', function(error) {
			if (error) return done(error);
			manager.page.waitFor('html.loaded').then(function() {
				done();
			}).catch(done);
		});
	},

	getPageLocationHash: function() {

		if (!manager.page) {
			throw new Error('No page is loaded.');
		}

		var pageUrl = manager.page.url();
		var parts = pageUrl.indexOf('#') !== -1 ? pageUrl.split('#') : [];
		return parts[1] || '';
	},

	socketServer: function(serverConfig) {

		serverConfig = _.defaults(serverConfig || {}, {
			port: 3600,
			pathname: '/primus',
			transformer: 'websockets',
			pingInterval: 5000,
		});

		var tmpApp = express();
		tmpApp.server = tmpApp.listen(serverConfig.port, 'localhost');
		var primus = new Primus(tmpApp.server, serverConfig);

		return {
			tmpApp: tmpApp,
			primus: primus,
			close: function() {
				if (primus) {
					primus.destroy();
					primus = null;
				}
				if (tmpApp) {
					tmpApp.server.close();
					tmpApp = null;
				}
			}
		};
	},

};

before(function(done) {
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
	if (!manager.browser) return done();
	manager.browser.close().then(function() {
		done();
	}).catch(done);
});
