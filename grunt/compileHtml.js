'use strict';

module.exports = {
	index: {
		nonull: true,
		src: ['index.html'],
		dest: 'build/index.html',
	},
	app: {
		src: 'index.html',
		dest: 'build/index.html',
	},
	test: {
		src: 'test/unit/runner-template.html',
		dest: 'test/unit/runner.html'
	}
};
