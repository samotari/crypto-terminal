var app = app || {};

app.config = (function() {

	'use strict';

	var config = {
		qrCodes: {
			cellSize: 5,
			margin: 0
		},
		settings: [
			{
				name: 'displayCurrency',
				label: 'Display Currency',
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