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
	bitcoin: {
		options: {
			mangle: {
				reserved: ['BigInteger', 'ECPair', 'Point']
			}
		},
		src: 'build/bitcoin.js',
		dest: 'build/bitcoin.min.js'
	},
	bs58check: {
		src: 'build/bs58check.js',
		dest: 'build/bs58check.min.js'
	},
	buffer: {
		src: 'build/buffer.js',
		dest: 'build/buffer.min.js'
	},
	ecurve: {
		options: {
			mangle: {
				reserved: ['Point']
			}
		},
		src: 'build/ecurve.js',
		dest: 'build/ecurve.min.js'
	},
	fastclick: {
		src: 'node_modules/fastclick/lib/fastclick.js',
		dest: 'build/fastclick.min.js'
	},
	querystring: {
		nonull: true,
		src: 'build/querystring.js',
		dest: 'build/querystring.min.js'
	},
	sjcl: {
		nonull: true,
		src: 'node_modules/sjcl/sjcl.js',
		dest: 'build/sjcl.min.js'
	}
};
