'use strict';

module.exports = {
	e2e: {
		src: [
			'test/e2e/*.js'
		],
		options: {
			reporter: 'spec',
			timeout: 5 * 60 * 1000,
			clearRequireCache: true
		}
	},
	unit: {
		src: [
			'test/unit/**/*.js'
		],
		options: {
			reporter: 'spec',
			timeout: 5 * 60 * 1000
		}
	}
};
