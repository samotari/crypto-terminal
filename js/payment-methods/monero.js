var app = app || {};

app.paymentMethods = app.paymentMethods || {};

app.paymentMethods.monero = (function() {

	'use strict';

	return app.abstracts.PaymentMethod.extend({

		label: 'Monero',
		code: 'XMR',

		settings: [
		],

		generatePaymentRequest: function(amount, cb) {

			this.getPaymentId(function(error, paymentId) {

				if (error) {
					return cb(error);
				}

				var paymentRequest = 'monero:' + address;
				paymentRequest += '?amount=' + amount;
				paymentRequest += '&payment_id=' + paymentId;
				cb(null, paymentRequest, address);
			});
		},

		generatePaymentId: function(cb) {

			var randomString = app.util.generateRandomString(32);
			var paymentId = '';
			for (var index = 0; index < randomString.length; index++ ) {
				paymentId += randomString.charCodeAt(index).toString(16);
			}

			_.defer(cb, null, paymentId);
		},

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
