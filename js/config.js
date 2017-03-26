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
		]
	};

})();
