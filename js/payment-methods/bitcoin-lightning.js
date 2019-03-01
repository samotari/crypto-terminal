var app = app || {};

app.paymentMethods = app.paymentMethods || {};

app.paymentMethods.bitcoinLightning = (function() {

	'use strict';

	return app.abstracts.PaymentMethod.extend({

		enabled: true,

		// The name of the cryptocurrency shown in the UI:
		label: 'Lightning Network',

		// The exchange symbol:
		code: 'BTC',

		// Used internally to reference itself:
		ref: 'bitcoinLightning',

		lang: {
			'en': {
				'settings.apiUrl.label': 'Lightning Node URL',
				'settings.apiUrl.description': 'The full URL to your LN node. Should include the protocol (e.g "https://").',
				'settings.invoiceMacaroon.label': 'Invoice Macaroon',
				'settings.invoiceMacaroon.description': 'Used to authenticate requests to your LN node. Should be in hexadecimal.',
				'addInvoice.failed': 'Failed to generate invoice',
				'getting-started.verify.message.success': 'Ok',
				'getting-started.verify.message.failed': 'Failed',
			},
			'de': {
				'settings.apiUrl.label': 'Lightning Network Knoten URL',
				'settings.apiUrl.description': 'Die vollständige URL zu Ihrem Lightning Network Knoten. Sollte das Protokoll enthalten (z.B. "https://").',
				'settings.invoiceMacaroon.label': 'Rechnung Macaroon',
				'settings.invoiceMacaroon.description': 'Wird verwendet, um Anfragen an Ihren Lightning Network Knoten zu authentifizieren. Sollte eine hexadezimal Zahl sein.',
				'addInvoice.failed': 'Fehler beim Generieren der Rechnung',
				'getting-started.verify.message.success': 'Ok',
				'getting-started.verify.message.failed': 'Fehlgeschlagen',
			},
			'es': {
				'settings.apiUrl.description': 'URL completa de su nodo LN',
				'settings.invoiceMacaroon.description': 'Código de autentificación (hexadecimal)',
				'addInvoice.failed': 'Fallo al crear factura',
				'getting-started.verify.message.failed': 'Fallo',
			},
			'fr': {
				'settings.apiUrl.label': 'URL du nœud Lightning',
				'settings.apiUrl.description': 'L\'URL complète de votre nœud Lightning Network. Inclure le protocole (ex: "https://").',
				'settings.invoiceMacaroon.label': 'Facture Macaroon',
				'settings.invoiceMacaroon.description': 'Utilisé pour authentifier les requêtes de votre nœud Lightning Network. Cela doit être en hexadécimal.',
				'addInvoice.failed': 'Impossible de générer la facture',
				'getting-started.verify.message.success': 'Ok',
				'getting-started.verify.message.failed': 'Échec',
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
				default: 'http://localhost:8080',
				label: function() {
					return app.i18n.t('bitcoinLightning.settings.apiUrl.label');
				},
				type: 'text',
				required: true,
				description: function() {
					return app.i18n.t('bitcoinLightning.settings.apiUrl.description');
				},
				validateAsync: function(value, data, cb) {
					$.ajax({
						url: value,
						method: 'GET',
					}).then(function(result) {
						console.log(result);
						cb();
					}).fail(function(error) {
						console.log(error);
						cb();
					});
				},
			},
			{
				name: 'invoiceMacaroon',
				default: '',
				label: function() {
					return app.i18n.t('bitcoinLightning.settings.invoiceMacaroon.label');
				},
				type: 'text',
				required: false,
				description: function() {
					return app.i18n.t('bitcoinLightning.settings.invoiceMacaroon.description');
				},
				actions: [
					{
						name: 'camera',
						fn: function(value, cb) {
							app.device.scanQRCodeWithCamera(cb);
						}
					}
				],
			},
		],

		createVerificationView: function(cb) {

			// Allowing this view only to render during getting started.
			// TODO: find a different approach to work with admin view.
			var isGettingStartedView = app.mainView.currentView.view.$el.hasClass('getting-started');
			if (!isGettingStartedView) {
				return;
			}

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
					});
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
				apiUrl: app.settings.get(this.ref + '.apiUrl'),
				maxInvoiceAgeInSeconds: Math.floor(app.config.paymentRequests.timeout / 1000),
				memo: app.info.name,
			});

			// Convert the amount to whole satoshis.
			var value = (new BigNumber(amount)).times('100000000').toFixed(0, BigNumber.ROUND_CEIL);
			var apiUrl = options.apiUrl;
			var uri = apiUrl + '/v1/invoices';
			var data = {
				expiry: options.maxInvoiceAgeInSeconds,
				value: value,
				memo: options.memo,
			};

			cb = _.once(cb);

			var headers = {
				'Content-Type': 'application/json',
			};

			var invoiceMacaroon = app.settings.get(this.ref + '.invoiceMacaroon');
			if (invoiceMacaroon) {
				headers['Grpc-Metadata-macaroon'] = invoiceMacaroon;
			}

			$.ajax({
				url: uri,
				method: 'POST',
				headers: headers,
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
				var id = Buffer.from(paymentRequest.data.r_hash, 'base64').toString('hex');
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
