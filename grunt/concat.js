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
			'build/css/secondary-controls.min.css',
			'build/css/number-pad.min.css',
			'build/css/slider.min.css',
			'build/css/views/*.min.css',
			'build/css/responsive.min.css'
		],
		dest: 'build/all.min.css'
	},
	workers: {
		nonull: true,
		files: [
			{
				src: [
					'node_modules/async/dist/async.min.js',
					'node_modules/bignumber.js/bignumber.min.js',
					'node_modules/underscore/underscore-min.js',
					'node_modules/js-sha3/build/sha3.min.js',
					'build/bigi.min.js',
					'build/bs58.min.js',
					'build/buffer.min.js',
					'build/ecurve.min.js',
					'third-party/sjcl/sjcl.min.js',
					'build/js/workers/bitcoin.min.js',
				],
				dest: 'build/workers/bitcoin.js',
			},
		],
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
			'build/qrcode.js',
			'node_modules/js-sha3/build/sha3.min.js',
			'build/base-x.js',
			'build/bigi.js',
			'build/bs58.js',
			'build/buffer.js',
			'build/ecurve.js',
			'build/querystring.js',
			'third-party/sjcl/sjcl.min.js',
			'node_modules/moment/moment.js',

			// Application files:
			'js/jquery.extend/*',
			'js/backbone.extend/*',
			'js/handlebars.extend/*',
			'js/app.js',
			'js/queues.js',
			'js/util.js',
			'js/device.js',
			'js/sqlite.js',
			'js/lang/*.js',
			'js/abstracts/*.js',
			'js/services/*.js',
			'js/models/*.js',
			'js/collections/*.js',
			'js/views/utility/*.js',
			'js/views/*.js',
			'js/payment-methods/bitcoin.js',
			'js/payment-methods/bitcoin-testnet.js',
			'js/payment-methods/bitcoin-lightning.js',
			'js/payment-methods/litecoin.js',
			'js/payment-methods/litecoin-testnet.js',
			'js/payment-methods/monero.js',
			'js/config.js',
			'js/cache.js',
			'js/settings.js',
			'js/i18n.js',
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
			'node_modules/backbone.localstorage/build/backbone.localStorage.min.js',
			'node_modules/handlebars/dist/handlebars.min.js',
			'build/qrcode.min.js',
			'node_modules/js-sha3/build/sha3.min.js',
			'build/base-x.min.js',
			'build/bigi.min.js',
			'build/bs58.min.js',
			'build/buffer.min.js',
			'build/ecurve.min.js',
			'build/querystring.min.js',
			'third-party/sjcl/sjcl.min.js',
			'node_modules/moment/min/moment.min.js',

			// Application files:
			'build/js/jquery.extend/*',
			'build/js/backbone.extend/*',
			'build/js/handlebars.extend/*',
			'build/js/app.min.js',
			'build/js/queues.min.js',
			'build/js/util.min.js',
			'build/js/device.min.js',
			'build/js/sqlite.min.js',
			'build/js/lang/*.min.js',
			'build/js/abstracts/*.min.js',
			'build/js/services/*.min.js',
			'build/js/models/*.min.js',
			'build/js/collections/*.min.js',
			'build/js/views/utility/*.min.js',
			'build/js/views/*.min.js',
			'build/js/payment-methods/bitcoin.min.js',
			'build/js/payment-methods/bitcoin-testnet.min.js',
			'build/js/payment-methods/bitcoin-lightning.min.js',
			'build/js/payment-methods/litecoin.min.js',
			'build/js/payment-methods/litecoin-testnet.min.js',
			'build/js/payment-methods/monero.min.js',
			'build/js/config.min.js',
			'build/js/cache.min.js',
			'build/js/settings.min.js',
			'build/js/i18n.min.js',
			'build/js/router.min.js',
			'build/js/init.min.js'
		],
		dest: 'build/all.min.js'
	},
	homepage_min_css: {
		nonull: true,
		src: [
			'build/homepage/css/fonts.min.css',
			'build/homepage/css/reset.min.css',
			'build/homepage/css/style.min.css'
		],
		dest: 'build/homepage/all.min.css'
	}
};
