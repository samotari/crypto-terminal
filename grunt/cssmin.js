'use strict';

module.exports = {
	all: {
		files: [{
			expand: true,
			cwd: 'css',
			src: ['**/*.css'],
			dest: 'build/css',
			ext: '.min.css'
		}]
	}
};
