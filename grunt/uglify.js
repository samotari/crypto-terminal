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
	bigi: {
		nonull: true,
		src: 'build/bigi.js',
		dest: 'build/bigi.min.js'
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
	fastclick: {
		src: 'node_modules/fastclick/lib/fastclick.js',
		dest: 'build/fastclick.min.js'
	},
	querystring: {
		nonull: true,
		src: 'build/querystring.js',
		dest: 'build/querystring.min.js'
	}
};
