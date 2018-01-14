var app = app || {};

app.config = (function() {

	'use strict';

	var config = {
		qrCodes: {
			errorCorrectionLevel: 'M',
			margin: 0,
		},
		defaultLocale: 'en',
		displayPaymentAddress: {
			listener: {
				// When to stop performing checks (milliseconds):
				timeout: 180000,
				delays: {
					// Wait time before the first check (milliseconds):
					first: 10000,
					// Wait time between checks (milliseconds):
					between: 5000
				}
			}
		},
		httpRequests: {
			timeBetweenRequests: 100
		},
		retryRequest: {
			// how many times it tries with an api when request fails (times):
			times: 5,
			// try calling apiMethod X times with exponential backoff (milliseconds):
			// (i.e. intervals of 100, 200, 400, 800, 1600, ...)
			interval: function(retryCount) {
				return 200 * Math.pow(2, retryCount);
			}
		},
		sliders: {
			speedThreshold: 0.4,// pixels / millisecond
		},
		numberOfSampleAddressesToShow: 5,
		settings: [
			{
				name: 'displayCurrency',
				label: function() {
					return app.i18n.t('settings.display-currency.label');
				},
				type: 'select',
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

	// Build an array of display currency keys.
	config.supportedDisplayCurrencies = _.pluck(
		_.findWhere(config.settings, { name: 'displayCurrency' }).options,
		'key'
	);

	return config;

})();
