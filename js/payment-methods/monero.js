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
			// Monero is NOT on Coinbase
			$.get('http://moneropric.es/fiat.json').then(function(result) {

				var rates = {};

				_.each(result.rates, function(rate) {
					rate[code] = rate[code].toUpperCase();
					if (_.contains(app.config.supportedDisplayCurrencies, rate[code])) {
						rates[rate[code]] = rate["fiat-rate"];
					}
				});

				cb(null, rates);

			}).fail(cb);
		}
	});
})();
