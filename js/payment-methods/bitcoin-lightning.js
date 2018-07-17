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

		instructions: function() {
			return app.i18n.t(this.ref + '.instructions');
		},

		lang: {
			'en': {
				'instructions': 'To use the Lightning Network (LN) you must run your own node. For more information please see <a href="https://github.com/samotari/crypto-terminal/blob/master/docs/how-to-configure-for-lightning-network.md">this detailed guide</a>.',
				'settings.apiUrl.label': 'API URL',
				'settings.apiUrl.description': 'Full url to your LN node',
				'settings.invoiceMacaroon.label': 'Invoice Macaroon',
				'settings.invoiceMacaroon.description': 'Authentication code (hexadecimal)',
				'addInvoice.failed': 'Failed to generate invoice',
				'getting-started.verify.message.success': 'Ok',
				'getting-started.verify.message.failed': 'Failed',
			},
			'es': {
				'instructions': 'Para usar Lightning Network (LN) tiene que correr su propio nodo. Más información <a href="https://github.com/samotari/crypto-terminal/blob/master/docs/how-to-configure-for-lightning-network.md">aquí</a>.',
				'settings.apiUrl.description': 'URL completa de su nodo LN',
				'settings.invoiceMacaroon.description': 'Código de autentificación (hexadecimal)',
				'addInvoice.failed': 'Fallo al crear factura',
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

		createVerificationView: function(cb) {

			var verificationAmount = 0.00000001;
			var options = {
				maxInvoiceAgeInSeconds: 5,
				memo: 'Test to verify connection from: ' + app.info.name,
			}

			app.busy(true);
			this.addInvoice(verificationAmount, options, function(error, result) {

				app.busy(false);
				var message = function() {
					return app.i18n.t('bitcoinLightning.getting-started.verify.message.success');
				}

				var verificationSuccess = !_.isError(error) && _.has(result, 'payment_request') && _.has(result, 'r_hash');

				if (!verificationSuccess) {
					message = function() {
						return app.i18n.t('bitcoinLightning.getting-started.verify.message.failed');
					}
				}

				try {
					var view = new app.views.ApiVerify({
						message: message,
						status: verificationSuccess ? 'success' : 'failed',
					})
				} catch (error) {
					return cb(error);
				}

				cb(null, view);
			})
		},

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

		addInvoice: function(amount, options, cb) {

			if (_.isFunction(options)) {
				cb = options;
				options = null;
			}

			options = _.defaults(options || {}, {
				maxInvoiceAgeInSeconds: Math.floor(app.config.paymentRequests.timeout / 1000),
				memo: app.info.name,
			});

			// Convert the amount to whole satoshis.
			var value = (new BigNumber(amount)).times('100000000').toFixed(0, BigNumber.ROUND_CEIL);
			var apiUrl = app.settings.get(this.ref + '.apiUrl');
			var uri = apiUrl + '/v1/invoices';
			var data = {
				expiry: options.maxInvoiceAgeInSeconds,
				value: value,
				memo: options.memo,
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
					var paymentData = _.pick(result, 'settle_date');
					// Passing paymentData so it can be stored.
					cb(null, wasReceived, paymentData);
				}).fail(cb);

			}, this));
		}
	});

})();
