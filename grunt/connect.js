'use strict';

module.exports = {
	homepage: {
		options: {
			port: 3003,
			hostname: 'localhost',
			base: 'build/homepage/www',
			keepalive: true
		}
	},
	static: {
		options: {
			port: 3000,
			hostname: 'localhost',
			base: 'www',
			keepalive: true
		}
	},
	e2e: {
		options: {
			port: 3002,
			hostname: 'localhost',
			base: 'www'
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
