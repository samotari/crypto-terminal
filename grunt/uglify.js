'use strict';

module.exports = {
	all: {
		files: [{
			expand: true,
			cwd: 'js',
			src: ['**/*.js'],
			dest: 'build/js',
			ext: '.min.js'
		}]
	}
};
