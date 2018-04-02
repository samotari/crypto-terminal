var app = app || {};

app.paymentMethods = app.paymentMethods || {};

app.paymentMethods.bitcoin = (function() {

	'use strict';

	app.onReady(function() {
		app.paymentRequests.on('add', function(model) {
			var status = model.get('status');
			if (status) {
				// Only payment requests with a status are considered.
				var paymentMethod = _.findWhere(app.paymentMethods, {
					code: model.get('currency'),
				});
				if (paymentMethod) {
					var settingPath = paymentMethod.ref + '.addressIndex';
					var index = parseInt(app.settings.get(settingPath) || '0');
					app.settings.set(settingPath, index + 1);
				}
			}
		});
	});

	return app.abstracts.PaymentMethod.extend({

		// The name of the cryptocurrency shown in the UI:
		label: 'Bitcoin',

		// The exchange symbol:
		code: 'BTC',

		// Used internally to reference itself:
		ref: 'bitcoin',

		// Used for chain.so API requests:
		chainSoCode: 'BTC',

		// Used to generate a payment request URI:
		uriScheme: 'bitcoin',

		// Used when formatting numbers (to be displayed in the UI).
		numberFormat: {
			decimals: 8,
		},

		lang: {
			'en': {
				'settings.addressIndex.label': 'Address Index',
				'settings.addressIndex.integer-required': 'Must be an integer',
				'settings.addressIndex.greater-than-or-equal-zero': 'Must be greater than or equal to zero',
				'settings.extendedPublicKey.label': 'Master Public Key',
				'settings.extendedPublicKey.invalid': 'Invalid master public key',
				'incorrect-number-of-bytes': 'Incorrect number of bytes',
				'invalid-checksum': 'Invalid checksum',
				'invalid-derivation-scheme': 'Invalid derivation scheme',
				'invalid-network-version': 'Invalid network version',
				'invalid-parent-fingerprint': 'Invalid parent fingerprint',
				'index-must-be-an-integer': 'Index must be an integer',
				'index-must-be-less-than': 'Index must be less than 2^32',
				'index-no-hardened': 'Hardened child keys are not supported',
				'failed-to-derive-address': 'Failed to derive address',
				'private-keys-warning': 'WARNING: Do NOT use private keys with this app!',
			},
			'es': {
				'settings.extendedPublicKey.label': 'Clave Pública Maestra',
				'settings.extendedPublicKey.invalid': 'La clave pública maestra no es valida',
				'invalid-parent-fingerprint': 'La huella paterna no es válida',
				'invalid-network-version': 'La versión de la red no es válida',
				'private-keys-warning': '¡ADVERTENCIA: NO utilice claves privadas en esta aplicación!',
			},
		},

		settings: [
			{
				name: 'extendedPublicKey',
				label: function() {
					return app.i18n.t('bitcoin.settings.extendedPublicKey.label');
				},
				type: 'text',
				required: true,
				validateAsync: function(value, cb) {
					this.worker.call('decodeExtendedPublicKey', [value, this.networks], cb);
				},
				actions: [
					{
						name: 'camera',
						fn: function(value, cb) {
							app.device.scanBarcodeWithCamera(cb);
						}
					}
				]
			},
			{
				name: 'addressIndex',
				label: function() {
					return app.i18n.t('bitcoin.settings.addressIndex.label');
				},
				type: 'text',
				required: true,
				default: '0',
				validate: function(value) {
					value = parseInt(value);
					if (_.isNaN(value)) {
						throw new Error(app.i18n.t('bitcoin.settings.addressIndex.integer-required'));
					}
					if (value < 0) {
						throw new Error(app.i18n.t('bitcoin.settings.addressIndex.greater-than-or-equal-zero'));
					}
				}
			},
			{
				name: 'derivationScheme',
				type: 'text',
				visible: false,
				default: 'm/0/n',
			}
		],

		networks: [
			{
				// Pay to public key hash:
				p2pkh: '00',
				// Pay to script hash:
				p2sh: '05',
				bip32: {
					public: '0488b21e',
					private: '0488ade4',
				},
			},
		],

		worker: app.createWorker('workers/bitcoin.js'),

		generatePaymentRequest: function(amount, cb) {

			var ref = this.ref;
			var uriScheme = this.uriScheme;
			var extendedPublicKey = app.settings.get(ref + '.extendedPublicKey');
			var derivationScheme = app.settings.get(ref + '.derivationScheme');
			var index = parseInt(app.settings.get(ref + '.addressIndex') || '0');

			this.deriveAddress(extendedPublicKey, derivationScheme, index, function(error, address) {

				if (error) {
					return cb(error);
				}

				var paymentRequest = {
					address: address,
					amount: amount,
					uri: uriScheme + ':' + address + '?amount=' + amount,
				};

				cb(null, paymentRequest);
			});
		},

		deriveAddress: function(extendedPublicKey, derivationScheme, addressIndex, cb) {

			var ref = this.ref;
			var networks = this.networks;
			var deriveLastParentExtendedPublicKey = _.bind(this.deriveLastParentExtendedPublicKey, this);
			var deriveChildKeyAtIndex = _.bind(this.deriveChildKeyAtIndex, this);
			var encodePublicKey = _.bind(this.encodePublicKey, this);

			async.seq(
				deriveLastParentExtendedPublicKey,
				function(lastParentExtendedPublicKey, next) {
					deriveChildKeyAtIndex(lastParentExtendedPublicKey, addressIndex, networks, next);
				}
			)(extendedPublicKey, derivationScheme, function(error, child) {

				if (error) {
					return cb(error);
				}

				if (!child) {
					return cb(new Error(ref + '.failed-to-derive-address'));
				}

				var address = encodePublicKey(child.key, child.network);
				cb(null, address);
			});
		},

		deriveLastParentExtendedPublicKey: function(extendedPublicKey, derivationScheme, cb) {

			var cacheKey = this.ref + '.lastParentExtendedPublicKey.' + extendedPublicKey;
			var lastParentExtendedPublicKey = app.cache.get(cacheKey) || null;

			if (lastParentExtendedPublicKey) {
				// From cache.
				_.defer(cb, null, lastParentExtendedPublicKey);
				return;
			}

			var networks = this.networks;
			var deriveChildKeyAtIndex = _.bind(this.deriveChildKeyAtIndex, this);
			var indexes = this.parseDerivationScheme(derivationScheme);

			async.until(function() { return !(indexes.length > 0); }, function(next) {

				var index = indexes.shift();
				var extendedKey = lastParentExtendedPublicKey || extendedPublicKey;

				deriveChildKeyAtIndex(extendedKey, index, networks, function(error, result) {

					if (error) {
						return next(error);
					}

					lastParentExtendedPublicKey = result && result.extendedKey;
					next();
				});

			}, function(error) {

				if (error) {
					return cb(error);
				}

				if (lastParentExtendedPublicKey) {
					app.cache.set(cacheKey, lastParentExtendedPublicKey);
				}

				cb(null, lastParentExtendedPublicKey);
			});
		},

		parseDerivationScheme: function(scheme) {

			if (!_.isString(scheme)) {
				throw new Error(app.i18n.t(this.ref + '.invalid-derivation-scheme'));
			}

			var parts = scheme.split('/');

			// Strip the reference to the master key.
			if (parts[0] === 'm') {
				parts = parts.slice(1);
			}

			// Strip the /n place-holder from the end.
			if (_.last(parts) === 'n') {
				parts = parts.slice(0, -1);
			}

			return _.map(parts, function(part) {
				if (parseInt(part).toString() !== part) {
					throw new Error(app.i18n.t(this.ref + '.invalid-derivation-scheme'));
				}
				return parseInt(part);
			}, this);
		},

		deriveChildKeyAtIndex: function(extendedPublicKey, index, networks, cb) {

			this.worker.call('deriveChildKeyAtIndex', [extendedPublicKey, index, networks], cb);
		},

		sha256sha256: function(data) {

			return sjcl.codec.hex.fromBits(
				sjcl.hash.sha256.hash(
					sjcl.hash.sha256.hash(
						sjcl.codec.hex.toBits(data)
					)
				)
			);
		},

		hash160: function(data) {

			return sjcl.codec.hex.fromBits(
				sjcl.hash.ripemd160.hash(
					sjcl.hash.sha256.hash(
						sjcl.codec.hex.toBits(data)
					)
				)
			);
		},

		/*
			See:
			https://en.bitcoin.it/wiki/Technical_background_of_version_1_Bitcoin_addresses#How_to_create_Bitcoin_Address
		*/
		encodePublicKey: function(publicKey, network) {

			network || (network = _.first(this.networks));
			var hash = this.hash160(publicKey);
			var version = network.p2pkh;
			var checksum = this.sha256sha256(version + hash).substr(0, 8);
			return bs58.encode(Buffer.from(version + hash + checksum, 'hex'));
		},

		listenForPayment: function(paymentRequest, cb) {

			var address = paymentRequest.address;
			var amount = paymentRequest.amount;
			var currency = this.chainSoCode;
			var amountReceived = new BigNumber('0');

			var done = _.bind(function() {
				this.stopListeningForPayment();
				cb.apply(undefined, arguments);
			}, this);

			app.services['chain.so'].listenForTransactionsToAddress(address, currency, function(error, tx) {

				if (error) {
					return done(error);
				}

				// Converted to the amount used in paymentRequest for right comparison.
				amountReceived = amountReceived
					.plus(tx.amount_received)
					.multipliedBy(paymentRequest.rate)
					.precision(15, BigNumber.ROUND_UP);

				if (amountReceived.isGreaterThanOrEqualTo(amount)) {
					return done(null, true/* wasReceived */);
				}

				// Continue listening..
			});
		},

		stopListeningForPayment: function() {

			app.services['chain.so'].stopListening();
		}

	});

})();
