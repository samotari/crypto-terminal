var app = app || {};

app.paymentMethods = app.paymentMethods || {};

app.paymentMethods.bitcoinLightning = (function() {

	'use strict';

	return app.abstracts.PaymentMethod.extend({

		// The name of the cryptocurrency shown in the UI:
		label: 'Bitcoin (LN)',

		// The exchange symbol:
		code: 'BTC',

		// Used internally to reference itself:
		ref: 'bitcoinLightning',

		description: function() {
			return app.i18n.t('bitcoinLightning.description');
		},

		lang: {
			'en': {
				'description': 'In order to use Bitcoin Lightning Network (LN) you have to run your own node. More info <a href="https://github.com/samotari/crypto-terminal/blob/master/docs/how-to-configure-for-lightning-network.md">here</a>.',
				'settings.apiUrl.label': 'API URL',
				'settings.apiUrl.description': 'Full url to your LN node',
				'settings.invoiceMacaroon.label': 'Invoice Macaroon',
				'settings.invoiceMacaroon.description': 'Authentication code (hexadecimal)',
				'addInvoice.failed': 'Failed to generate invoice',
			}
		},

		config: {
			listenForPayment: {
				pollingDelay: 2000,
			},
		},

		settings: [
			{
				name: 'apiUrl',
				default: 'http://localhost:8280',
				label: function() {
					return app.i18n.t('bitcoinLightning.settings.apiUrl.label');
				},
				type: 'text',
				required: true,
				description: function() {
					return app.i18n.t('bitcoinLightning.settings.apiUrl.description');
				},
			},
			{
				name: 'invoiceMacaroon',
				default: '',
				label: function() {
					return app.i18n.t('bitcoinLightning.settings.invoiceMacaroon.label');
				},
				type: 'text',
				required: true,
				description: function() {
					return app.i18n.t('bitcoinLightning.settings.invoiceMacaroon.description');
				},
			},
		],

		generatePaymentRequest: function(amount, cb) {

			this.addInvoice(amount, _.bind(function(error, response) {

				if (error) {
					return cb(error);
				}

				var paymentRequest = {
					amount: amount,
					uri: response.payment_request,
					data: {
						r_hash: response.r_hash,
					},
				};

				cb(null, paymentRequest);

			},this));
		},

		addInvoice: function(amount, cb) {

			// Convert the amount to whole satoshis.
			var value = (new BigNumber(amount)).times('100000000').toFixed(0, BigNumber.ROUND_CEIL);
			var apiUrl = app.settings.get(this.ref + '.apiUrl');
			var maxInvoiceAgeInSeconds = Math.floor(app.config.paymentRequests.timeout / 1000);
			var uri = apiUrl + '/v1/invoices';
			var data = {
				expiry: maxInvoiceAgeInSeconds,
				value: value,
			};

			cb = _.once(cb);

			$.ajax({
				url: uri,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Grpc-Metadata-macaroon': app.settings.get(this.ref + '.invoiceMacaroon')
				},
				data: JSON.stringify(data),
			}).then(function(result) {
				cb(null, result);
			}).fail(function(error) {
				app.log(error);
				cb(new Error(app.i18n.t('bitcoinLightning.addInvoice.failed')));
			});
		},

		getApiUrl: function(uri) {

			var baseUrl = app.settings.get(this.ref + '.apiUrl');
			return baseUrl + uri;
		},

		checkPaymentReceived: function(paymentRequest, cb) {

			_.defer(_.bind(function() {
				var id = (new Buffer(paymentRequest.data.r_hash, 'base64')).toString('hex');
				var uri = this.getApiUrl('/v1/invoice/' + encodeURIComponent(id));
				$.ajax({
					url: uri,
					method: 'GET',
					headers: {
						'Grpc-Metadata-macaroon': app.settings.get(this.ref + '.invoiceMacaroon')
					},
				}).then(function(result) {
					var wasReceived = result.settled === true;
					cb(null, wasReceived);
				}).fail(cb);

			}, this));
		}
	});

})();
