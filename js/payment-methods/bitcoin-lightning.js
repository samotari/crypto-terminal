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
				'settings.failed-authentication-check.unexpected-response': 'Failed LN node test: Unexpected response',
			},
			'de': {
				'settings.apiUrl.label': 'Lightning Network Knoten URL',
				'settings.apiUrl.description': 'Die vollständige URL zu Ihrem Lightning Network Knoten. Sollte das Protokoll enthalten (z.B. "https://").',
				'settings.invoiceMacaroon.label': 'Rechnung Macaroon',
				'settings.invoiceMacaroon.description': 'Wird verwendet, um Anfragen an Ihren Lightning Network Knoten zu authentifizieren. Sollte eine hexadezimal Zahl sein.',
			},
			'es': {
				'settings.apiUrl.description': 'URL completa de su nodo LN',
				'settings.invoiceMacaroon.description': 'Código de autentificación (hexadecimal)',
			},
			'fr': {
				'settings.apiUrl.label': 'URL du nœud Lightning',
				'settings.apiUrl.description': 'L\'URL complète de votre nœud Lightning Network. Inclure le protocole (ex: "https://").',
				'settings.invoiceMacaroon.label': 'Facture Macaroon',
				'settings.invoiceMacaroon.description': 'Utilisé pour authentifier les requêtes de votre nœud Lightning Network. Cela doit être en hexadécimal.',
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
				type: 'text',
				required: false,
				default: '',
				label: function() {
					return app.i18n.t('bitcoinLightning.settings.apiUrl.label');
				},
				description: function() {
					return app.i18n.t('bitcoinLightning.settings.apiUrl.description');
				},
				validateAsync: function(value, data, cb) {
					var invoiceMacaroon = data[this.ref + '.invoiceMacaroon'];
					this.doAuthenticationCheck(value, invoiceMacaroon, cb);
				},
			},
			{
				name: 'invoiceMacaroon',
				type: 'text',
				required: false,
				default: '',
				label: function() {
					return app.i18n.t('bitcoinLightning.settings.invoiceMacaroon.label');
				},
				description: function() {
					return app.i18n.t('bitcoinLightning.settings.invoiceMacaroon.description');
				},
				actions: [
					{
						name: 'camera',
						fn: function(value, cb) {
							app.device.scanQRCodeWithCamera(cb);
						},
					},
				],
			},
		],

		toBaseUnit: function() {

			return app.paymentMethods.bitcoin.toBaseUnit.apply(this, arguments);
		},

		fromBaseUnit: function(value) {

			return app.paymentMethods.bitcoin.fromBaseUnit.apply(this, arguments);
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

		doAuthenticationCheck: function(apiUrl, invoiceMacaroon, cb) {

			var amount = 1e-8;
			var options = {
				apiUrl: apiUrl,
				invoiceMacaroon: invoiceMacaroon,
				maxInvoiceAgeInSeconds: 10,
				memo: app.info.name + ': Authentication check',
			};
			this.addInvoice(amount, options, cb);
		},

		addInvoice: function(amount, options, cb) {

			if (_.isFunction(options)) {
				cb = options;
				options = null;
			}

			options = _.defaults(options || {}, {
				maxInvoiceAgeInSeconds: Math.floor(app.config.paymentRequests.timeout / 1000),
				memo: app.info.name + ': Generate new invoice',
			});

			var value = this.toBaseUnit(amount)
			var data = {
				expiry: options.maxInvoiceAgeInSeconds,
				value: value,
				memo: options.memo,
			};
			var uri = '/v1/invoices';
			var requestOptions = _.extend({}, _.pick(options, 'apiUrl', 'invoiceMacaroon'), {
				data: data,
				headers: {
					'Content-Type': 'application/json',
				},
			});

			this.request('post', uri, requestOptions, cb);
		},

		checkPaymentReceived: function(paymentRequest, options, cb) {

			if (_.isFunction(options)) {
				cb = options;
				options = null;
			}

			options = options || {};

			var id = Buffer.from(paymentRequest.data.r_hash, 'base64').toString('hex');
			var uri = '/v1/invoice/' + encodeURIComponent(id);
			var requestOptions = _.pick(options, 'apiUrl', 'invoiceMacaroon');
			this.request('get', uri, requestOptions, function(error, result) {
				if (error) return cb(error);
				var wasReceived = result.settled === true;
				var paymentData = _.pick(result, 'settle_date');
				// Passing paymentData so it can be stored.
				cb(null, wasReceived, paymentData);
			});
		},

		request: function(method, uri, options, cb) {

			if (_.isFunction(options)) {
				cb = options;
				options = null;
			}

			options = _.defaults(options || {}, {
				apiUrl: app.settings.get(this.ref + '.apiUrl'),
				invoiceMacaroon: app.settings.get(this.ref + '.invoiceMacaroon'),
				headers: {},
			});

			if (options.invoiceMacaroon) {
				options.headers['Grpc-Metadata-macaroon'] = options.invoiceMacaroon;
			}

			var ajaxOptions = {
				url: options.apiUrl + uri,
				method: method.toUpperCase(),
				headers: options.headers,
			};

			if (options.data) {
				ajaxOptions.data = JSON.stringify(options.data);
			}

			var done = _.once(cb);
			$.ajax(ajaxOptions).then(function(result) {
				done(null, result);
			}).fail(function(jqXHR) {
				var error = new Error(app.i18n.t('http-request-failed', {
					message: app.util.getErrorMessageFromJQueryXHRObject(jqXHR),
				}));
				cb(error);
			});
		},
	});

})();
