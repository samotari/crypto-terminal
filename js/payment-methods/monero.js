var app = app || {};

app.paymentMethods = app.paymentMethods || {};

app.paymentMethods.monero = (function() {

	'use strict';

	return app.abstracts.PaymentMethod.extend({

		label: 'Monero',
		code: 'XMR',

		settings: [
		],

		getExchangeRates: function(cb) {

			// Get exchange rate info from Coinbase's API.
			$.get('https://api.coinbase.com/v2/exchange-rates?currency=BTC').then(function(result) {

				var rates = {};

				_.each(result.data.rates, function(rate, code) {
					code = code.toUpperCase();
					if (_.contains(app.config.supportedDisplayCurrencies, code)) {
						rates[code] = rate;
					}
				});

				cb(null, rates);

			}).fail(cb);
		}
	});
})();
