var app = app || {};

app.paymentMethods = app.paymentMethods || {};

app.paymentMethods.bitcoin = (function() {

	'use strict';

	return app.abstracts.PaymentMethod.extend({

		// The name of the cryptocurrency shown in the UI:
		label: 'Bitcoin',

		// The exchange symbol:
		code: 'BTC',

		// Used internally to reference itself:
		ref: 'bitcoin',

		// Used to get gap limit
		gapLimit: 1,

		lang: {
			'en': {
				'settings.xpub.label': 'Master Public Key',
				'settings.xpub.invalid': 'Invalid master public key',
				'invalid-payment-request': 'Invalid payment request',
				'xpub-required': 'Master public key is required',
				'invalid-parent-fingerprint': 'Invalid parent fingerprint',
				'invalid-network-version': 'Invalid network version',
				'private-keys-warning': 'WARNING: Do NOT use private keys with this app!',
				'error-beforesaving': 'Error before saving settings',
				'settings.error-getting-gap-limit': 'Error in getting "gap limit".',
			},
			'es': {
				'settings.xpub.label': 'Clave Pública Maestra',
				'settings.xpub.invalid': 'La clave pública maestra no es valida',
				'settings.scheme.label': 'Ruta de dirección',
				'invalid-payment-request': 'Solicitud de pago',
				'xpub-required': 'Falta la clave pública maestra ',
				'invalid-parent-fingerprint': 'La huella paterna no es válida',
				'invalid-network-version': 'La versión de la red no es válida',
				'private-keys-warning': '¡ADVERTENCIA: NO utilice claves privadas en esta aplicación!',
				'error-beforesaving': 'Error antes de guardar settings',
				'settings.error-getting-gap-limit': 'Error obteniendo "gap limit"'
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
				beforeSaving: function(data, cb) {

					this.getFirstIndexOfGap(data[this.ref + '.xpub'], _.bind(function(error, firstIndexOfGap) {

						if (error) {
							console.log(app.i18n.t(this.ref + 'bitcoin.settings.error-beforesaving'));
							return cb(error);
						}

						var lastIndexObj = {};
						lastIndexObj[this.ref + '.lastIndex'] = firstIndexOfGap;

						var fixedData = _.extend({}, data, lastIndexObj);

						cb(null, fixedData);
					}, this));
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

				var paymentRequest = this.ref + ':' + address + '?amount=' + amount;
				cb(null, paymentRequest, address);

			}, this));
		},

		getPaymentAddress: function(cb) {

			var index = parseInt(app.settings.get(this.ref + '.lastIndex') || 0) + 1;

			var xpub = app.settings.get(this.ref + '.xpub');

			this.getAddress(index, xpub, _.bind(function(error, address) {

				if (error) {
					return cb(error);
				}

				app.settings.set(this.ref + '.lastIndex', index).save();
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

			var buffer = base58check.decode(xpub);

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

		checkPaymentReceived: function(paymentRequest, cb) {

			_.defer(_.bind(function() {

				var matches = paymentRequest.match(/bitcoin:([a-zA-Z0-9]+)\?amount=([0-9\.]+)/);

				if (!matches) {
					return cb(new Error(app.i18n.t('bitcoin.invalid-payment-request')));
				}

				var address = matches[1];
				var amount = matches[2];
				var networkName = this.getNetworkName();

				var requestArr = app.util.requestArrFactory(
					[
						app.services.blockexplorer.getUnconfirmedBalance
					],
					{address: address, networkName: networkName, amount: amount}
				)

				async.tryEach(
					requestArr,
					function(error, results) {

						if (error) {
							return cb(error);
						}

						var wasReceived = results[0];
						var amountReceived = results[1];

						cb(null, wasReceived, amountReceived);
					}
				);

			}, this));
		},

		checkIfAddressWasUsed: function(index, xpub, cb) {

			this.getAddress(index, xpub, _.bind(function(error, address) {

				if (error) {
					return cb(error);
				}

				var networkName = this.getNetwork(xpub).name;

				var requestArr = app.util.requestArrFactory(
					[
						app.services.blockexplorer.getTotalReceiveByAddressAndNetworkName
					],
					{address: address, networkName: networkName}
				)

				async.tryEach(
					requestArr,
					function(error, results) {

						if (error) {
							return cb(error);
						}

						var totalReceived = results;

						try {
							var indexWasUsed = totalReceived.greaterThan('0');
						} catch (error) {
							return cb(error);
						}

						cb(null, indexWasUsed);
					}
				)
			}, this))
		},

		/**
			finds the first index that contains gapLimit number of not used addresses
		 */
		getFirstIndexOfGap: function(xpub, cb) {
			var gapLimit = this.gapLimit;
			var gap = 0;
			var index = 0;
			var checkIfAddressWasUsed = _.bind(this.checkIfAddressWasUsed, this);
			var ref = this.ref;
			
			async.whilst(
				function() { return gap < gapLimit },
				function(callback) {
					checkIfAddressWasUsed(index, xpub, function(error, indexWasUsed) {

						if (error) {
							return callback(error);
						}
						if (indexWasUsed) {
							gap = 0;
						} else {
							gap++;
						}
						
						index++;
						callback();
					})

				},
				function(error) {

					if (error) {
						console.log(app.i18n.t(ref + 'settings.error-getting-gap-limit'));
						return cb(error);
					}

					cb(null, index - gap);

				}
			)

		},

	});
})();
