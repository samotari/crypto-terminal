'use strict';

var _ = require('underscore');
var webdriverio = require('webdriverio');

var config = {
	// Uncomment the following line to enable verbose logging for webdriverio.
	// logLevel: 'verbose',
	timeouts: {
		'script': 2 * 60 * 1000,
		'implicit': 5 * 1000,
		'page load': 30 * 1000
	},
	viewport: {
		width: 1024,
		height: 768
	}
};

module.exports = {

	createClient: function(options) {

		options = _.defaults(options || {}, {
			desiredCapabilities: process.env.E2E_DESIRED ? JSON.parse(process.env.E2E_DESIRED) : {},
			logLevel: config.logLevel
		});

		// https://code.google.com/p/selenium/wiki/DesiredCapabilities
		options.desiredCapabilities = _.defaults(options.desiredCapabilities || {}, {
			browserName: 'chrome'
		});

		var client = webdriverio.remote(options);

		return client.init()
			.setViewportSize(config.viewport, false)
			.timeouts('script', config.timeouts['script'])
			/*
				Cannot set 'implicit' timeout because of a bug in webdriverio [1].
					[1] https://github.com/webdriverio/webdriverio/issues/974
			*/
			// .timeouts('implicit', config.timeouts['implicit'])
			.timeouts('page load', config.timeouts['page load']);
	}
};
