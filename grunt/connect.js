'use strict';

module.exports = {
	static: {
		options: {
			port: 3000,
			hostname: 'localhost',
			base: 'www',
			keepalive: true
		}
	},
	test: {
		options: {
			port: 3001,
			hostname: 'localhost',
			base: 'www'
		}
	}
};
