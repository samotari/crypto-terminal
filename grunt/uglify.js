'use strict';

module.exports = {
	all: {
		files: [
			{
				nonull: true,
				expand: true,
				cwd: 'js',
				src: ['**/*.js'],
				dest: 'build/js',
				ext: '.min.js'
			}
		]
	},
	basex: {
		nonull: true,
		src: 'build/base-x.js',
		dest: 'build/base-x.min.js'
	},
	bech32: {
		nonull: true,
		src: 'build/bech32.js',
		dest: 'build/bech32.min.js'
	},
	bigi: {
		nonull: true,
		src: 'build/bigi.js',
		dest: 'build/bigi.min.js'
	},
	bitcoin: {
		nonull: true,
		options: {
			mangle: {
				reserved: ['BigInteger', 'ECPair', 'Point'],
			},
		},
		src: 'build/bitcoin.js',
		dest: 'build/bitcoin.min.js'
	},
	bs58: {
		src: 'build/bs58.js',
		dest: 'build/bs58.min.js'
	},
	buffer: {
		src: 'build/buffer.js',
		dest: 'build/buffer.min.js'
	},
	ecurve: {
		nonull: true,
		src: 'build/ecurve.js',
		dest: 'build/ecurve.min.js'
	},
	qrcode: {
		nonull: true,
		src: 'build/qrcode.js',
		dest: 'build/qrcode.min.js'
	},
	querystring: {
		nonull: true,
		src: 'build/querystring.js',
		dest: 'build/querystring.min.js'
	}
};
