var app = app || {};

app.config = (function() {

	'use strict';

	var config = {
		qrCodes: {
			cellSize: 5,
			margin: 0
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