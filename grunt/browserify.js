'use strict';

module.exports = {
	bitcoin: {
		options: {
			standalone: 'bitcoin',
			transform: [['babelify', { presets: ['es2015'] }]]
		},
		src: 'node_modules/bitcoinjs-lib/src/index.js',
		dest: 'build/bitcoin.js'
	},
	bs58check: {
		options: {
			standalone: 'base58check'
		},
		src: 'node_modules/bs58check/index.js',
		dest: 'build/bs58check.js'
	},
	ecurve: {
		options: {
			standalone: 'ecurve'
		},
		src: 'node_modules/ecurve/lib/index.js',
		dest: 'build/ecurve.js'
	},
	monero: {
		options: {
			standalone: 'monero',
			transform: [['babelify', { presets: ['es2015'] }]]
		},
		src: 'exports/monero.js',
		dest: 'build/monero.js'
	}
};
