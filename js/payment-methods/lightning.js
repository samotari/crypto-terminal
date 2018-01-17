var app = app || {};

app.paymentMethods = app.paymentMethods || {};

app.paymentMethods.lightning = (function() {

	'use strict';

	return app.abstracts.PaymentMethod.extend({

		// The name of the cryptocurrency shown in the UI:
		label: 'Lightning',

		// The exchange symbol:
		code: 'BTC',

		// Used internally to reference itself:
		ref: 'lightning',

		lang: {
			'en': {
				'settings.api-url.label': 'API URL',
				'settings.invoice-max-age.label': 'Invoice maximum age (seconds)',
				'invalid-payment-request': 'Invalid payment request',
			}
		},

		settings: [
			{
				name: 'api-url',
				default: 'http://localhost:8280',
				label: function() {
					return app.i18n.t('lightning.settings.api-url.label');
				},
				type: 'text',
				required: true
			},
			{
				name: 'invoice-max-age',
				default: 3600,
				label: function() {
					return app.i18n.t('lightning.settings.invoice-max-age.label');
				},
				type: 'integer',
				required: true
			}
		],

		getExchangeRates: function(cb) {

			app.services.coinbase.getExchangeRates(this.code, cb);
		},

		generatePaymentRequest: function(amount, cb) {

			this.addInvoice(amount, _.bind(function(error, response) {

				if (error) {
					return cb(error);
				}

				var paymentRequest = this.ref + ':' + response.payment_request;
				cb(null, paymentRequest, paymentRequest/* address */, amount);

			},this));
		},

		addInvoice: function(amount, cb) {

			// Convert the amount to satoshis.
			var value = (new BigNumber(amount)).dividedBy('100000000').toString();
			var apiUrl = app.settings.get(this.ref + '.api-url');
			var expiry = parseInt(app.settings.get(this.ref + '.invoice-max-age'));
			var uri = apiUrl + '/api/lnd/addinvoice';

			var data = {
				memo: '',
				value: value,
				expiry: expiry
			};

			$.post(uri, data).then(function(result, error) {
				cb(null, result);
			}).fail(cb);
		},

		checkPaymentReceived: function(paymentRequest, cb) {

			_.defer(_.bind(function() {

				var matches = paymentRequest.match(/lightning:([a-zA-Z0-9]+)/);

				if (!matches) {
					return cb(new Error(app.i18n.t('lightning.invalid-payment-request')));
				}

				var payreq = matches[1];
				var apiUrl = app.settings.get(this.ref + '.api-url');
				var uri = apiUrl + '/api/lnd/listinvoices';
				var wasReceived = false;
				var amountReceived = 0;

				$.get(uri).then(function(result) {

					_.each(result.invoices, function(invoice) {
						if (invoice.payment_request === payreq) {
							wasReceived = invoice.settled;
							amountReceived = invoice.value;
							return false;// break from the .each function
						}
					});

					cb(null, wasReceived, amountReceived);

				}).fail(cb);

			}, this));
		}
	});

})();
