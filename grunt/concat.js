'use strict';

module.exports = {
	all_min_css: {
		nonull: true,
		src: [
			'build/css/fonts.min.css',
			'build/css/reset.min.css',
			'build/css/base.min.css',
			'build/css/buttons.min.css',
			'build/css/forms.min.css',
			'build/css/header.min.css',
			'build/css/menu.min.css',
			'build/css/amount.min.css',
			'build/css/numpad.min.css',
			'build/css/views/*.min.css'
		],
		dest: 'build/all.min.css'
	},
	all_js: {
		nonull: true,
		src: [
			// Dependencies:
			'node_modules/async/dist/async.js',
			'node_modules/bignumber.js/bignumber.js',
			'node_modules/jquery/dist/jquery.js',
			'node_modules/underscore/underscore.js',
			'node_modules/backbone/backbone.js',
			'node_modules/backbone.localstorage/build/backbone.localStorage.js',
			'node_modules/handlebars/dist/handlebars.js',
			'node_modules/qrcode-generator/qrcode.js',
			'build/bitcoin.js',
			'node_modules/sjcl/sjcl.js',
			'node_modules/moment/moment.js',

			// Application files:
			'js/jquery.extend/*',
			'js/handlebars.extend/*',
			'js/util.js',
			'js/abstracts/*.js',
			'js/models/*.js',
			'js/collections/*.js',
			'js/views/*.js',
			'js/payment-methods/*.js',
			'js/config.js',
			'js/router.js',
			'js/init.js'
		],
		dest: 'build/all.js'
	},
	all_min_js: {
		nonull: true,
		src: [
			// Dependencies:
			'node_modules/async/dist/async.min.js',
			'node_modules/bignumber.js/bignumber.min.js',
			'node_modules/jquery/dist/jquery.min.js',
			'node_modules/underscore/underscore-min.js',
			'node_modules/backbone/backbone-min.js',
			'node_modules/handlebars/dist/handlebars.min.js',
			'build/qrcode-generator/qrcode.min.js',
			'build/bitcoin.min.js',
			'node_modules/sjcl/sjcl.js',
			'node_modules/moment/min/moment.min.js',

			// Application files:
			'build/js/jquery.extend/*',
			'build/js/handlebars.extend/*',
			'build/js/abstracts/*.min.js',
			'build/js/util.min.js',
			'build/js/config.min.js',
			'build/js/router.min.js',
			'build/js/models/*.min.js',
			'build/js/collections/*.min.js',
			'build/js/views/*.min.js',
			'build/js/payment-methods/*.min.js',
			'build/js/init.min.js'
		],
		dest: 'build/all.min.js'
	}
};
