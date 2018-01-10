var app = app || {};

app.paymentMethods = app.paymentMethods || {};

app.paymentMethods.monero = (function() {

	'use strict';

	/*
		https://getmonero.org/get-started/what-is-monero/
	*/

	return app.abstracts.PaymentMethod.extend({

		// The name of the cryptocurrency shown in the UI:
		label: 'Monero',

		// The exchange symbol:
		code: 'XMR',

		// Used internally to reference itself:
		ref: 'monero',

		lang: {
			'en': {
				'settings.public-address.label': 'Public Address',
				'settings.public-address.invalid': 'Invalid public address',
				'settings.view-private-key.label': 'View Private Key',
				'settings.view-private-key.invalid': 'Invalid view private key',
				'payment-request.public-address-required': 'Public address is required to generate a payment request',
			}
		},

		settings: [
			{
				name: 'public-address',
				label: function() {
					return app.i18n.t('monero.settings.public-address.label');
				},
				type: 'text',
				required: true,
				validate: function(value) {
					if (!app.paymentMethods.monero.validatePublicAddress(value)) {
						throw new Error(app.i18n.t('monero.settings.public-address.invalid'));
					}
				}
			},
			{
				name: 'viewPrivateKey',
				label: function() {
					return app.i18n.t('monero.settings.view-private-key.label');
				},
				type: 'text',
				required: true,
				validate: function(value) {
					if (!app.paymentMethods.monero.validateViewPrivateKey(value)) {
						throw new Error(app.i18n.t('monero.settings.view-private-key.invalid'));
					}
				}
			}
		],

		validatePublicAddress: function(publicAddress) {

			// !! TODO !!
			return false;
		},

		validateViewPrivateKey: function(viewPrivateKey) {

			// !! TODO !!
			return false;
		},

		generatePaymentRequest: function(amount, cb) {

			_.defer(_.bind(function() {

				try {

					var address = app.settings.get('monero.public-address');

					if (!address) {
						throw new Error(app.i18n.t('monero.payment-request.public-address-required'));
					}

					var paymentId = this.generatePaymentId();
					var parameters = {
						tx_payment_id: paymentId,
						tx_amount: amount
					};

					var paymentRequest = address + '?' + querystring.stringify(parameters);

				} catch (error) {
					return cb(error);
				}

				cb(null, paymentRequest, address, amount);

			}, this));
		},

		/*
			To uniquely identify each payment request, we need a payment ID.

			See:
			https://getmonero.org/resources/moneropedia/paymentid.html
		*/
		generatePaymentId: function() {

			var randomString = app.util.generateRandomString(32);
			var paymentId = '';
			for (var index = 0; index < randomString.length; index++ ) {
				paymentId += randomString.charCodeAt(index).toString(16);
			}
			return paymentId;
		},

		getExchangeRates: function(cb) {

			// First get the currency rates for bitcoin.
			app.paymentMethods.bitcoin.getExchangeRates(function(error, btcRates) {

				if (error) {
					return cb(error);
				}

				// Then get the bitcoin->monero rate.
				$.get('https://poloniex.com/public?command=returnTicker').then(function(poloniex) {

					var xmrToBtcRate = new BigNumber(poloniex.BTC_XMR.last);
					var rates = {};

					// Convert from Fiat->BTC rate to Fiat->XMR.
					_.each(btcRates, function(btcRate, code) {
						code = code.toUpperCase();
						if (_.contains(app.config.supportedDisplayCurrencies, code)) {
							rates[code] = (new BigNumber(btcRate)).times(xmrToBtcRate).toString();
						}
					});

					cb(null, rates);

				}).fail(cb);
			});
		}
	});
})();
