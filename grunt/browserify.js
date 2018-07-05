'use strict';

module.exports = {
	basex: {
		options: {
			standalone: 'basex'
		},
		src: 'node_modules/base-x/index.js',
		dest: 'build/base-x.js'
	},
	bech32: {
		options: {
			standalone: 'bech32'
		},
		src: 'node_modules/bech32/index.js',
		dest: 'build/bech32.js'
	},
	bigi: {
		options: {
			standalone: 'BigInteger'
		},
		src: 'node_modules/bigi/lib/index.js',
		dest: 'build/bigi.js'
	},
	bitcoin: {
		options: {
			standalone: 'bitcoin',
			transform: [['babelify', { presets: ['es2015'] }]]
		},
		src: 'node_modules/bitcoinjs-lib/src/index.js',
		dest: 'build/bitcoin.js'
	},
	bs58: {
		options: {
			standalone: 'bs58'
		},
		src: 'node_modules/bs58/index.js',
		dest: 'build/bs58.js'
	},
	buffer: {
		options: {
			standalone: 'Buffer'
		},
		src: 'exports/buffer.js',
		dest: 'build/buffer.js'
	},
	ecurve: {
		options: {
			standalone: 'ecurve'
		},
		src: 'node_modules/ecurve/lib/index.js',
		dest: 'build/ecurve.js'
	},
	qrcode: {
		options: {
			standalone: 'QRCode'
		},
		src: 'node_modules/qrcode/lib/browser.js',
		dest: 'build/qrcode.js'
	},
	querystring: {
		options: {
			standalone: 'querystring'
		},
		src: 'exports/querystring.js',
		dest: 'build/querystring.js'
	}
};
