'use strict';

module.exports = {
	test: {
		ctApi: {
			baseUrl: 'http://localhost:3601',
		},
	},
	dev: {
		ctApi: {
			baseUrl: 'http://localhost:3600',
		},
	},
	prod: {
		ctApi: {
			baseUrl: 'https://api.cryptoterminal.eu',
		},
	},
};
