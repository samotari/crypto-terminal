var app = app || {};

app.config = (function() {

	'use strict';

	return {
		qrCodes: {
			cellSize: 5,
			margin: 0
		},
		supportedDisplayCurrencies: [
			// Crypto:
			'BTC', 'XMR',
			// Fiat:
			'CZK', 'EUR', 'USD'
		],
		settings: [
			{
				name: 'displayCurrency',
				label: 'Display Currency',
				type: 'select',
				required: true,
				options: [
					// Crypto
					{
						key: 'BTC',
						label: 'Bitcoin'
					},
					// Fiat
					{
						key: 'EUR',
						label: 'EUR'
					}, {
						key: 'CZK',
						label: 'CZK'
					}, {
						key: 'USD',
						label: 'USD'
					}
				]
			},
		/* {
					// more settings
			} */
		],
	};

})();