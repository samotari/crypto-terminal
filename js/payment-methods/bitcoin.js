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

		// Used for chain.so API requests:
		chainSoCode: 'BTC',

		// Used to generate a payment request URI:
		uriScheme: 'bitcoin',

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
				validate: function(value) {
					this.validateExtendedPublicKey(value);
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

		generatePaymentRequest: function(amount, cb) {

			this.getPaymentAddress(_.bind(function(error, address) {

				if (error) {
					return cb(error);
				}

				var paymentRequest = {
					address: address,
					amount: amount,
					uri: this.uriScheme + ':' + address + '?amount=' + amount,
				};

				cb(null, paymentRequest);

			}, this));
		},

		getPaymentAddress: function(cb) {

			var ref = this.ref;
			var extendedPublicKey = app.settings.get(ref + '.extendedPublicKey');
			var index = parseInt(app.settings.get(ref + '.addressIndex') || '0');

			_.defer(_.bind(function() {

				try {
					var address = this.deriveAddress(extendedPublicKey, index);
				} catch (error) {
					return cb(error);
				}

				app.settings.set(ref + '.addressIndex', index + 1);
				cb(null, address);

			}, this));
		},

		validateExtendedPublicKey: function(extendedPublicKey) {

			this.decodeExtendedPublicKey(extendedPublicKey);

			// If we got this far, it's valid.
			return true;
		},

		deriveAddress: function(extendedPublicKey, addressIndex) {

			var scheme = app.settings.get(this.ref + '.derivationScheme');
			var indexes = this.parseDerivationScheme(scheme);
			indexes.push(addressIndex);
			var child;
			_.each(indexes, function(index) {
				var extendedKey = child && child.extendedKey || extendedPublicKey;
				child = this.deriveChildKeyAtIndex(extendedKey, index);
			}, this);
			if (!child) {
				throw new Error(app.i18n.t(this.ref + '.failed-to-derive-address'));
			}
			var address = this.encodePublicKey(child.key, child.network);
			return address;
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

		deriveChildKeyAtIndex: function(extendedPublicKey, index) {

			if (parseInt(index).toString() !== index.toString()) {
				throw new Error(app.i18n.t(this.ref + '.index-must-be-an-integer'));
			}

			try {
				index = new BigNumber(index);
			} catch (error) {
				throw new Error(app.i18n.t(this.ref + '.index-must-be-an-integer'));
			}

			if (index.isGreaterThanOrEqualTo(0x100000000)) {
				// Maximum number of child keys is 2^32.
				throw new Error(app.i18n.t(this.ref + '.index-must-be-less-than'));
			}

			if (index.isGreaterThanOrEqualTo(0x80000000)) {
				// Hardened child keys start at index 2^31.
				throw new Error(app.i18n.t(this.ref + '.index-no-hardened'));
			}

			var decoded = this.decodeExtendedPublicKey(extendedPublicKey);

			/*
				https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#public-parent-key--public-child-key
			*/
			var hmac = new sjcl.misc.hmac(
				sjcl.codec.hex.toBits(decoded.chainCode),
				sjcl.hash.sha512
			);

			// I = HMAC-SHA512(Key = cpar, Data = serP(Kpar) || ser32(i))
			var I = sjcl.codec.hex.fromBits(hmac.encrypt(sjcl.codec.hex.toBits(
				decoded.publicKey + this.leftPadHex(index.toString(16), 8)
			)));
			// Split I into two 32-byte sequences, IL and IR.
			var IL = I.substr(0, 64);
			var IR = I.substr(64, 64);

			var curve = ecurve.getCurveByName('secp256k1');
			var Kpar = ecurve.Point.decodeFrom(curve, Buffer.from(decoded.publicKey, 'hex'));
			curve.validate(Kpar);

			var pIL = BigInteger.fromBuffer(Buffer.from(IL, 'hex'));

			// In case parse256(IL) >= n, proceed with the next value for i
			if (pIL.compareTo(curve.n) >= 0) {
				return this.deriveChildKey(extendedPublicKey, index + 1);
			}

			// The returned child key is point(parse256(IL)) + Kpar.
			//	= G*IL + Kpar
			var Ki = curve.G.multiply(pIL).add(Kpar);

			if (curve.isInfinity(Ki)) {
				return this.deriveChildKey(extendedPublicKey, index + 1);
			}

			curve.validate(Ki);

			var network = decoded.network;
			var prefix = network.bip32.public;
			// Left pad with a leading zero.
			var depth = this.leftPadHex((new BigNumber('0x' + decoded.depth)).toNumber() + 1, 2);
			var parentFingerPrint = this.hash160(decoded.publicKey).substr(0, 8);
			// Left pad with leading zeroes.
			var keyIndex = this.leftPadHex(index, 8);
			var chainCode = IR;
			var compressedKey = Buffer.from(Ki.getEncoded(true)).toString('hex');

			var extendedKey = [
				prefix,
				depth,
				parentFingerPrint,
				keyIndex,
				chainCode,
				compressedKey,
			].join('');

			var checksum = this.sha256sha256(extendedKey).substr(0, 8);
			var encodedExtendedKey = bs58.encode(Buffer.from(extendedKey + checksum, 'hex'));

			return {
				chainCode: chainCode,
				depth: depth,
				extendedKey: encodedExtendedKey,
				key: compressedKey,
				network: network,
				parentFingerPrint: parentFingerPrint,
			};
		},

		decompressPublicKey: function(publicKey) {

			var curve = ecurve.getCurveByName('secp256k1');
			var point = ecurve.Point.decodeFrom(curve, Buffer.from(publicKey, 'hex'));
			return Buffer.from(point.getEncoded(false)).toString('hex');
		},

		leftPadHex: function(hex, length) {

			for (var index = 0; index < length; index++) {
				hex = '0' + hex;
			}

			return hex.toString(16).substr(-1 * length);
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

		/*
			See:
			https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#serialization-format

			And:
			https://bitcoin.stackexchange.com/questions/62533/key-derivation-in-hd-wallets-using-the-extended-private-key-vs-hardened-derivati

			[ magic ][ depth ][ parent fingerprint ][ key index ][ chain code ][ key ]
		*/
		decodeExtendedPublicKey: function(extendedPublicKey) {

			var hex = bs58.decode(extendedPublicKey).toString('hex');

			// Expect 82 bytes.
			if (hex.length !== 164) {
				throw new Error(app.i18n.t(this.ref + '.incorrect-number-of-bytes'));
			}

			// Check version bytes.
			var version = hex.substr(0, 8).toLowerCase();

			var network = _.find(this.networks, function(network) {
				if (version === network.bip32.private) {
					throw new Error(app.i18n.t(this.ref + '.private-keys-warning'));
				}
				return version === network.bip32.public;
			}, this);

			if (!network) {
				throw new Error(app.i18n.t(this.ref + '.invalid-network-version'));
			}

			// Validate the checksum.
			var checksum = hex.substr(156, 8);
			var hash = this.sha256sha256(hex.substr(0, 156));

			if (hash.substr(0, 8) !== checksum) {
				// Invalid checksum.
				throw new Error(app.i18n.t(this.ref + '.invalid-checksum'));
			}

			// 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 derived keys, ....
			var depth = hex.substr(8, 2);

			// 4 bytes: the fingerprint of the parent's key (0x00000000 if master key)
			var parentFingerPrint = hex.substr(10, 8);
			if (depth === '00' && parentFingerPrint !== '00000000') {
				throw new Error(app.i18n.t(this.ref + '.invalid-parent-fingerprint'));
			}

			var index = hex.substr(18, 8);

			// 32 bytes: the chain code
			var chainCode = hex.substr(26, 64);

			// 33 bytes: public key data (0x02 + X or 0x03 + X)
			var compressedPublicKey = hex.substr(90, 66);

			return {
				chainCode: chainCode,
				checksum: hex.substr(156, 8),
				depth: depth,
				index: index,
				network: network,
				parentFingerPrint: parentFingerPrint,
				publicKey: compressedPublicKey,
			};
		},

		getExchangeRates: function(cb) {

			app.services.coinbase.getExchangeRates(this.code, cb);
		},

		listenForPayment: function(paymentRequest, cb) {

			var address = paymentRequest.address;
			var amount = paymentRequest.amount;
			var currency = this.chainSoCode;
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
		}

	});

})();
