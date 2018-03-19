var app = app || {};

app.config = (function() {

	'use strict';

	var config = {
		debug: true,
		sqlite: {
			name: 'crypto-terminal.db',
			location: 'default',
			uniqueId: {
				length: 20,
				charset: 'abcdefghijklmnopqrstuvqxyzABCDEFGHIJKLMNOPQRSTUVQXYZ1234567890-_',
			},
		},
		qrCodes: {
			errorCorrectionLevel: 'M',
			margin: 0,
		},
		defaultLocale: 'en',
		numberPad: {
			keysMaxLength: 12,
		},
		sliders: {
			speedThreshold: 0.4,// pixels / millisecond
		},
		touch: {
			quick: {
				// Maximum time between touchstart and touchend; milliseconds.
				maxTime: 400,
				// Maximum percent of screen traveled for emitting "quicktouch" event.
				maxMovement: 4,
				// Time to show visual feedback; milliseconds.
				uiFeedbackDuration: 60,
			},
			long: {
				// Delay before emitting "longtouch" event; milliseconds.
				delay: 500,
			},
		},
		// Preset amounts are displayed on the #pay screen as buttons.
		presets: {
			// Example:
			// 'CZK': ['150', '200']
		},
		numberOfSampleAddressesToShow: 5,
		settingsPin: {
			minLength: 1,
			unlockTime: 5 * 60 * 1000,
		},
		settings: [
			{
				name: 'configurableCryptoCurrencies',
				visible: false,
				default: [],
			},
			{
				name: 'displayCurrency',
				label: function() {
					return app.i18n.t('settings.display-currency.label');
				},
				type: 'select',
				default: 'CZK',
				required: true,
				options: [].concat(
					_.chain(app.paymentMethods).values().pluck('code').map(function(code) {
						return {
							key: code,
							label: code
						}
					}).value(),
					[
						{
							key: 'EUR',
							label: 'EUR'
						},
						{
							key: 'CZK',
							label: 'CZK'
						},
						{
							key: 'USD',
							label: 'USD'
						}
					]
				)
			},
			{
				name: 'dateFormat',
				label: function() {
					return app.i18n.t('settings.date-format.label');
				},
				type: 'select',
				required: true,
				options: [
					{
						key: 'MMMM Do YYYY, h:mm:ss A',
						label: moment().format('MMMM Do YYYY, h:mm:ss A')
					},
					{
						key: 'lll',
						label: moment().format('lll')
					},
					{
						key: 'LLLL',
						label: moment().format('LLLL')
					},
					{
						key: 'DD/MM/YYYY hh:mm:ss',
						label: moment().format('DD/MM/YYYY hh:mm:ss')
					}
				]
			}
		]
	};

	config.settings = _.map(config.settings, function(setting) {
		return _.extend({}, setting, {
			visible: setting.visible !== false,
		});
	});

	// Build an array of display currency keys.
	config.supportedDisplayCurrencies = _.pluck(
		_.findWhere(config.settings, { name: 'displayCurrency' }).options,
		'key'
	);

	return config;

})();
