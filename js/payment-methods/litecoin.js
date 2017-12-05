var app = app || {};

app.paymentMethods = app.paymentMethods || {};

app.paymentMethods.litecoin = (function() {

	'use strict';

	return app.abstracts.PaymentMethod.extend({

		label: 'Litecoin',
		code: 'LTC',

		lang: {
			'en': {
				'settings.xpub.label': 'Master Public Key',
				'settings.xpub.invalid': 'Invalid master public key',
				'settings.scheme.label': 'Address Path',
				'invalid-payment-request': 'Invalid payment request',
				'xpub-required-to-get-address': 'xpub required to get litecoin payment address',
				'xpub-required': '"xpub" is required',
				'invalid-parent-fingerprint': 'Invalid parent fingerprint',
				'invalid-network-version': 'Invalid network version',
				'private-keys-warning': 'WARNING: Do NOT use private keys with this app!',
			}
		},

		settings: [
			{
				name: 'xpub',
				label: function() {
					return app.i18n.t('litecoin.settings.xpub.label');
				},
				type: 'text',
				required: true,
				validate: function(value) {
					try {
						var node = app.paymentMethods.litecoin.getHDNodeInstance(value);
					} catch (error) {
						console.log(error);
					}
					if (!node) {
						throw new Error(app.i18n.t('litecoin.settings.xpub.invalid'));
					}
				}
			},
			{
				name: 'scheme',
				label: function() {
					return app.i18n.t('litecoin.settings.scheme.label');
				},
				type: 'text',
				default: 'm/0/n',
				required: true
			}
		],

		/*
			Litecoin mainnet and testnet network constants.

				- Public key hash:
					Used in the generation of addresses from public keys.
					(mainnet) https://github.com/litecoin-project/litecore-lib/blob/9c3b2712de14335d2a953a8772aee87e23be6cf6/lib/networks.js#L132
					(testnet) https://github.com/litecoin-project/litecore-lib/blob/9c3b2712de14335d2a953a8772aee87e23be6cf6/lib/networks.js#L158

				- Script hash:
					Used in the generation of scripting addresses from public keys.
					(mainnet) https://github.com/litecoin-project/litecore-lib/blob/9c3b2712de14335d2a953a8772aee87e23be6cf6/lib/networks.js#L134
					(testnet) https://github.com/litecoin-project/litecore-lib/blob/9c3b2712de14335d2a953a8772aee87e23be6cf6/lib/networks.js#L160

				- WIF:
					"Wallet Import Format"
					Used to encode private keys in a way to be more easily copied.
					(mainnet) https://github.com/litecoin-project/litecore-lib/blob/9c3b2712de14335d2a953a8772aee87e23be6cf6/lib/networks.js#L133
					(testnet) https://github.com/litecoin-project/litecore-lib/blob/9c3b2712de14335d2a953a8772aee87e23be6cf6/lib/networks.js#L159

				- BIP32 public/private key constants:
					Used in the generation of child addresses from master public/private keys.
					(mainnet) https://github.com/litecoin-project/litecoin/blob/ba8ed3a93be7e7a97db6bc00dd7280fa2f1548bc/src/chainparams.cpp#L137-L138
					(testnet)https://github.com/litecoin-project/litecoin/blob/ba8ed3a93be7e7a97db6bc00dd7280fa2f1548bc/src/chainparams.cpp#L239-L240
		*/
		networks: {
			mainnet: _.extend({}, bitcoin.networks.litecoin, {
				bip32: {
					public: (new Buffer([0x04, 0x88, 0xB2, 0x1E])).readUInt32BE(0),
					private: (new Buffer([0x04, 0x88, 0xAD, 0xE4])).readUInt32BE(0)
				},
				pubKeyHash: 0x30,
				scriptHash: 0x32,
				wif: 0xB0
			}),
			testnet: _.extend({}, bitcoin.networks.litecoin, {
				bip32: {
					public: (new Buffer([0x04, 0x35, 0x87, 0xCF])).readUInt32BE(0),
					private: (new Buffer([0x04, 0x35, 0x83, 0x94])).readUInt32BE(0)
				},
				pubKeyHash: 0x6F,
				scriptHash: 0x3A,
				wif: 0xEF
			})
		},

		generatePaymentRequest: function(amount, cb) {

			this.getPaymentAddress(function(error, address) {

				if (error) {
					return cb(error);
				}

				var paymentRequest = 'litecoin:' + address + '?amount=' + amount;
				cb(null, paymentRequest, address);
			});
		},

		checkPaymentReceived: function(paymentRequest, cb) {

			_.defer(_.bind(function() {

				var matches = paymentRequest.match(/litecoin:([a-zA-Z0-9]+)\?amount=([0-9\.]+)/);

				if (!matches) {
					return cb(new Error(app.i18n.t('litecoin.invalid-payment-request')));
				}

				var address = matches[1];
				var amount = matches[2];
				var network = this.getNetwork();

				/*
					For API details:
					https://chain.so/api#get-balance
				*/
				var uri = 'https://chain.so/api/v2/get_address_balance';

				// Network (e.g LTC or LTCTEST):
				uri += '/' + (network === 'mainnet' ? 'LTC' : 'LTCTEST');
				// Address:
				uri += '/' + encodeURIComponent(address);
				// Minimum number of confirmations:
				uri += '/0';

				$.get(uri).then(function(result) {

					try {
						var amountReceived = (new BigNumber('0'))
							.plus(result.data.confirmed_balance)
							.plus(result.data.unconfirmed_balance);
					} catch (error) {
						return cb(error);
					}

					var wasReceived = amountReceived.greaterThanOrEqualTo(amount);
					cb(null, wasReceived, amountReceived);

				}).fail(cb);
			}, this));
		},

		getPaymentAddress: function(cb) {

			var index = parseInt(app.settings.get('litecoin.lastIndex') || 0) + 1;

			this.getAddress(index, function(error, address) {

				if (error) {
					return cb(error);
				}

				app.settings.set('litecoin.lastIndex', index).save();
				cb(null, address);
			});
		},

		getAddress: function(index, cb) {

			_.defer(_.bind(function() {

				var address;

				try {

					var xpub = app.settings.get('litecoin.xpub');

					if (!xpub) {
						throw new Error(app.i18n.t('litecoin.xpub-required-to-get-address'));
					}

					var scheme = app.settings.get('litecoin.scheme');

					try {
						var node = this.getHDNodeInstance(xpub);
					} catch (error) {
						console.log(error);
					}

					if (!node) {
						throw new Error(app.i18n.t('litecoin.settings.xpub.invalid'));
					}

					switch (scheme) {

						case 'm/0/n':
							address = node.derive(0).derive(index).getAddress().toString();
							break;

						case 'n':
							address = node.derive(index).getAddress().toString();
							break;
					}

				} catch (error) {
					return cb(error);
				}

				cb(null, address);

			}, this));
		},

		getHDNodeInstance: function(xpub) {

			if (!xpub) {
				throw new Error(app.i18n.t('litecoin.xpub-required'));
			}

			var buffer = base58check.decode(xpub);

			if (buffer.length !== 78) {
				throw new Error('Invalid buffer length');
			}

			// 4 bytes: version bytes
			var version = buffer.readUInt32BE(0);

			var network = _.find(this.networks, function(_network) {
				if (version === _network.bip32.private) {
					throw new Error(app.i18n.t('litecoin.private-keys-warning'));
				}
				return version === _network.bip32.public;
			});

			if (version !== network.bip32.public) {
				throw new Error(app.i18n.t('litecoin.invalid-network-version'));
			}

			var curve = ecurve.getCurveByName('secp256k1');

			// 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants, ...
			var depth = buffer[4];

			// 4 bytes: the fingerprint of the parent's key (0x00000000 if master key)
			var parentFingerprint = buffer.readUInt32BE(5)
			if (depth === 0 && parentFingerprint !== 0x00000000) {
				throw new Error(app.i18n.t('litecoin.invalid-parent-fingerprint'));
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

		getNetwork: function() {
			var xpub = app.settings.get('litecoin.xpub');
			var buffer = base58check.decode(xpub);
			if (buffer.length !== 78) {
				throw new Error('Invalid buffer length');
			}
			var version = buffer.readUInt32BE(0);
			var networkName;
			_.each(this.networks, function(network, name) {
				if (version === network.bip32.private) {
					throw new Error('Private keys not supported');
				}
				if (version === network.bip32.public) {
					networkName = name;
				}
			});
			return networkName || null;
		},

		getExchangeRates: function(cb) {
			app.services.coinbase.getExchangeRates('LTC', cb);
		}
	});
})();
