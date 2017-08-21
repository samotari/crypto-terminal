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
			},
			{
				nonull: true,
				src: 'node_modules/qrcode-generator/qrcode.js',
				dest: 'build/qrcode-generator/qrcode.min.js'
			}
		]
	},
	bitcoinjs: {
		options: {
			mangle: {
				except: ['Array', 'BigInteger', 'Boolean', 'ECPair', 'Function', 'Number', 'Point']
			}
		},
		src: 'build/bitcoin.js',
		dest: 'build/bitcoin.min.js'
	}
};
