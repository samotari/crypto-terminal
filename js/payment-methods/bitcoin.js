var app = app || {};

app.paymentMethods = app.paymentMethods || {};

app.paymentMethods.bitcoin = (function() {

	'use strict';

	return app.abstracts.PaymentMethod.extend({

		// The name of the cryptocurrency shown in the UI:
		label: 'Bitcoin',

		// The exchange symbol:
		code: 'BTC',

		// Symbol for testnet:
		testnetCode: 'BTCTEST',

		// Used internally to reference itself:
		ref: 'bitcoin',

		lang: {
			'en': {
				'settings.xpub.label': 'Master Public Key',
				'settings.xpub.invalid': 'Invalid master public key',
				'settings.addressIndex.label': 'Address Index',
				'settings.addressIndex.integer-required': 'Must be an integer',
				'settings.addressIndex.greater-than-or-equal-zero': 'Must be greater than or equal to zero',
				'invalid-payment-request': 'Invalid payment request',
				'xpub-required': 'Master public key is required',
				'invalid-parent-fingerprint': 'Invalid parent fingerprint',
				'invalid-network-version': 'Invalid network version',
				'private-keys-warning': 'WARNING: Do NOT use private keys with this app!',
			},
			'es': {
				'settings.xpub.label': 'Clave Pública Maestra',
				'settings.xpub.invalid': 'La clave pública maestra no es valida',
				'invalid-payment-request': 'Solicitud de pago',
				'xpub-required': 'Falta la clave pública maestra ',
				'invalid-parent-fingerprint': 'La huella paterna no es válida',
				'invalid-network-version': 'La versión de la red no es válida',
				'private-keys-warning': '¡ADVERTENCIA: NO utilice claves privadas en esta aplicación!',
			},
		},

		settings: [
			{
				name: 'xpub',
				label: function() {
					return app.i18n.t('bitcoin.settings.xpub.label');
				},
				type: 'text',
				required: true,
				validate: function(value) {
					if (!app.paymentMethods.bitcoin.prepareHDNodeInstance(value)) {
						throw new Error(app.i18n.t('bitcoin.settings.xpub.invalid'));
					}
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
			}
		],

		networks: [
			_.extend({}, bitcoin.networks.bitcoin, {
				name: 'mainnet'
			}),
			_.extend({}, bitcoin.networks.testnet, {
				name: 'testnet'
			})
		],

		generatePaymentRequest: function(amount, cb) {

			this.getPaymentAddress(_.bind(function(error, address) {

				if (error) {
					return cb(error);
				}

				var paymentRequest = {
					address: address,
					amount: amount,
					uri: this.ref + ':' + address + '?amount=' + amount,
				};

				cb(null, paymentRequest);

			}, this));
		},

		getPaymentAddress: function(cb) {

			var index = parseInt(app.settings.get(this.ref + '.addressIndex') || '0');
			var xpub = app.settings.get(this.ref + '.xpub');

			this.getAddress(index, xpub, _.bind(function(error, address) {

				if (error) {
					return cb(error);
				}

				app.settings.set(this.ref + '.addressIndex', index + 1);
				cb(null, address);

			}, this));
		},

		getAddress: function(index, xpub, cb) {

			_.defer(_.bind(function() {

				try {
					var node = this.prepareHDNodeInstance(xpub);
					var address = node.derive(0).derive(index).getAddress().toString();
				} catch (error) {
					return cb(error);
				}

				cb(null, address);

			}, this));
		},

		/*
			Prepares an instance of the hierarchical deterministic class from bitcoinjs-lib.

			xpub is a master public key.
		*/
		prepareHDNodeInstance: function(xpub) {

			if (!xpub) {
				throw new Error(app.i18n.t(this.ref + '.xpub-required'));
			}

			var buffer = this.xpubToBuffer(xpub);
			var network = this.getNetwork(buffer);

			if (!network) {
				console.log(app.i18n.t(this.ref + '.invalid-network-version'));
				throw new Error(app.i18n.t(this.ref + '.invalid-xpub'));
			}

			var curve = ecurve.getCurveByName('secp256k1');

			// 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants, ...
			var depth = buffer[4];

			// 4 bytes: the fingerprint of the parent's key (0x00000000 if master key)
			var parentFingerprint = buffer.readUInt32BE(5)
			if (depth === 0 && parentFingerprint !== 0x00000000) {
				console.log(app.i18n.t(this.ref + '.invalid-parent-fingerprint'));
				throw new Error(app.i18n.t(this.ref + '.invalid-xpub'));
			}

			// 32 bytes: the chain code
			var chainCode = buffer.slice(13, 45);

			// 33 bytes: public key data (0x02 + X or 0x03 + X)
			var Q = ecurve.Point.decodeFrom(curve, buffer.slice(45, 78));
			// Q.compressed is assumed, if somehow this assumption is broken, `new HDNode` will throw
			// Verify that the X coordinate in the public point corresponds to a point on the curve.
			// If not, the extended public key is invalid.
			curve.validate(Q);
			var keyPair = new bitcoin.ECPair(null, Q, { network: network });
			var node = new bitcoin.HDNode(keyPair, chainCode);
			node.depth = depth;
			node.index = 0;
			node.parentFingerprint = parentFingerprint;
			return node;
		},

		xpubToBuffer: function(xpub) {

			var buffer = bs58.decode(xpub);

			// Strip the last four bytes (checksum).
			buffer = buffer.slice(0, -4);

			if (buffer.length !== 78) {
				throw new Error(this.ref + '.xpub-invalid');
			}

			return buffer;
		},

		getNetwork: function(xpubStringOrBuffer) {

			var buffer;

			if (_.isString(xpubStringOrBuffer)) {
				buffer = this.xpubToBuffer(xpubStringOrBuffer);
			} else {
				buffer = xpubStringOrBuffer;
			}

			// 4 bytes: version bytes
			var version = buffer.readUInt32BE(0);

			return _.find(this.networks, function(network) {
				if (version === network.bip32.private) {
					throw new Error(app.i18n.t(this.ref + '.private-keys-warning'));
				}
				return version === network.bip32.public;
			}, this);
		},

		getNetworkName: function() {

			var xpub = app.settings.get(this.ref + '.xpub');
			var network = this.getNetwork(xpub);
			return network.name;
		},

		getExchangeRates: function(cb) {

			app.services.coinbase.getExchangeRates(this.code, cb);
		},

		listenForPayment: function(paymentRequest, cb) {

			var address = paymentRequest.address;
			var amount = paymentRequest.amount;
			var networkName = this.getNetworkName();
			var currency = networkName === 'mainnet' ? this.code : this.testnetCode;
			var amountReceived = new BigNumber('0');

			var done = _.bind(function() {
				app.services['chain.so'].stopListening();
				cb.apply(undefined, arguments);
			}, this);

			app.services['chain.so'].listenForTransactionsToAddress(address, currency, function(error, tx) {

				if (error) {
					return done(error);
				}

				amountReceived = amountReceived.plus(tx.amount_received);

				if (amountReceived.isGreaterThanOrEqualTo(amount)) {
					return done(null, true/* wasReceived */);
				}

				// Continue listening..
			});
		},

		stopListeningForPayment: function() {

			app.services['chain.so'].stopListening();
		},

	});
})();
