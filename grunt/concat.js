'use strict';

module.exports = {
	all_min_css: {
		src: [
			'build/css/fonts.min.css',
			'build/css/reset.min.css',
			'build/css/styles.min.css'
		],
		dest: 'build/all.min.css'
	},
	all_js: {
		src: [
			// Dependencies:
			'node_modules/bignumber.js/bignumber.js',
			'node_modules/jquery/dist/jquery.js',
			'node_modules/underscore/underscore.js',
			'node_modules/backbone/backbone.js',
			'node_modules/backbone.localstorage/backbone.localStorage.js',
			'node_modules/handlebars/dist/handlebars.js',
			'node_modules/sjcl/sjcl.js',

			// Application files:
			'js/router.js',
			'js/models/*.js',
			'js/views/*.js',
			'js/init.js'
		],
		dest: 'build/all.js'
	},
	all_min_js: {
		src: [
			// Dependencies:
			'node_modules/bignumber.js/bignumber.min.js',
			'node_modules/jquery/dist/jquery.min.js',
			'node_modules/underscore/underscore-min.js',
			'node_modules/backbone/backbone-min.js',
			'node_modules/backbone.localstorage/backbone.localStorage.min.js',
			'node_modules/handlebars/dist/handlebars.min.js',
			'node_modules/sjcl/sjcl.js',

			// Application files:
			'build/js/router.min.js',
			'build/js/models/*.min.js',
			'build/js/views/*.min.js',
			'build/js/init.min.js'
		],
		dest: 'build/all.min.js'
	}
};
