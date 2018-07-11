'use strict';

var _ = require('underscore');
var express = require('express');
var puppeteer = require('puppeteer');
var Primus = require('primus');

var gruntConfig = {
	connect: require('../grunt/connect'),
};

var manager = module.exports = {

	browser: null,
	page: null,

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

		var host = gruntConfig.connect.test.options.hostname;
		var port = gruntConfig.connect.test.options.port;
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

	socketServer : function(serverConfig) {

		serverConfig = _.defaults(serverConfig || {}, {
			port: 3601,
			pathname: '/primus',
			transformer: 'uws',
			pingInterval: 5000,
		})

		var tmpApp = express();
		tmpApp.server = tmpApp.listen(serverConfig.port, 'localhost');
		var primus = new Primus(tmpApp.server, serverConfig);

		return {
			tmpApp: tmpApp,
			primus: primus,
			close: function() {
				primus.destroy();
				tmpApp.server.close();
				tmpApp = null;
				primus = null;
			}
		};
	},

};

before(function(done) {
	manager.prepareBrowser(done);
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
