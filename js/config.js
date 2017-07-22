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
				options: [
					{
						key: 'BTC',
						label: 'BTC'
					},
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
			}
		]
	};

	// Build an array of display currency keys.
	config.supportedDisplayCurrencies = _.map(
		_.findWhere(config.settings, { name: 'displayCurrency' }).options,
		function(option) {
			return option.key;
		}
	);

	return config;

})();