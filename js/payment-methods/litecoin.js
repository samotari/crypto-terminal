var app = app || {};

app.paymentMethods = app.paymentMethods || {};

app.paymentMethods.litecoin = (function() {

	'use strict';

	return app.abstracts.PaymentMethod.extend({

		label: 'Litecoin',
		code: 'LTC',

		settings: [
			{
				name: 'xpub',
				label: 'Master Public Key',
				type: 'text',
				required: true,
				validate: function(value) {
					try {
						var node = app.paymentMethods.litecoin.getHDNodeInstance(value);
					} catch (error) {
						console.log(error);
					}
					if (!node) {
						throw new Error('Invalid master public key');
					}
				}
			},
			{
				name: 'scheme',
				label: 'Address Path',
				type: 'text',
				default: 'm/0/n',
				required: true
			}
		],

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
					return cb(new Error('Invalid payment request'));
				}

				var address = matches[1];
				var amount = matches[2];

				/*
					For API details:
					https://chain.so/api#get-balance
				*/
				var uri = 'https://chain.so/api/v2/get_address_balance';
				// Network (e.g LTC or LTCTEST):
				uri += '/LTC';
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
						throw new Error('xpub required to get litecoin payment address');
					}

					var scheme = app.settings.get('litecoin.scheme');

					try {
						var node = this.getHDNodeInstance(xpub);
					} catch (error) {
						console.log(error);
					}

					if (!node) {
						throw new Error('Invalid litecoin master public key');
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
				throw new Error('"xpub" is required');
			}

			var buffer = base58check.decode(xpub);

			if (buffer.length !== 78) {
				throw new Error('Invalid buffer length');
			}

			var curve = ecurve.getCurveByName('secp256k1');

			// 4 bytes: version bytes
			var version = buffer.readUInt32BE(0);

			// Use the litecoin network constants.
			// But use the BIP32 constants from bitcoin.
			var network = _.extend({}, bitcoin.networks.litecoin, {
				bip32: bitcoin.networks.bitcoin.bip32
			});

			if (version === network.bip32.private) {
				throw new Error('Private keys not supported');
			}

			if (version !== network.bip32.public) {
				throw new Error('Invalid network version');
			}

			// 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 descendants, ...
			var depth = buffer[4];

			// 4 bytes: the fingerprint of the parent's key (0x00000000 if master key)
			var parentFingerprint = buffer.readUInt32BE(5)
			if (depth === 0 && parentFingerprint !== 0x00000000) {
				throw new Error('Invalid parent fingerprint');
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

		getExchangeRates: function(cb) {
			app.services.coinbase.getExchangeRates('LTC', cb);
		}
	});
})();
