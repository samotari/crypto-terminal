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
				'settings.extendedPublicKey.label': 'Extended Public Key',
				'incorrect-number-of-bytes': 'Incorrect number of bytes',
				'invalid-checksum': 'Invalid checksum',
				'invalid-derivation-scheme': 'Invalid derivation scheme',
				'invalid-network-byte': 'Invalid network byte',
				'invalid-parent-fingerprint': 'Invalid parent fingerprint',
				'index-must-be-an-integer': 'Index must be an integer',
				'index-must-be-less-than': 'Index must be less than 2^32',
				'index-no-hardened': 'Hardened child keys are not supported',
				'failed-to-derive-address': 'Failed to derive address',
				'private-keys-warning': 'WARNING: Do NOT use private keys with this app!',
				'segwit-not-supported': 'Segwit addresses are not supported yet. If your wallet allows you to do so, please use a "legacy" extended public key (xpub) instead.',
			},
			'cs': {
				'settings.addressIndex.label': 'Index adresy',
				'settings.addressIndex.integer-required': 'Musí být celé číslo',
				'settings.addressIndex.greater-than-or-equal-zero': 'Musí být větší nebo rovno nule',
				'settings.extendedPublicKey.label': 'Rozšířený veřejný klíč',
				'incorrect-number-of-bytes': 'Nesprávný počet bajtů',
				'invalid-checksum': 'Neplatný kontrolní součet',
				'invalid-derivation-scheme': 'Neplatná schéma odvození',
				'invalid-network-byte': 'Neplatný síťový byte',
				'invalid-parent-fingerprint': 'Neplatný nadřazený otisk prstu',
				'index-must-be-an-integer': 'Index musí být celé číslo',
				'index-must-be-less-than': 'Index musí být menší než 2^32',
				'index-no-hardened': 'Tvrdé podřízené klíče nejsou podporovány',
				'failed-to-derive-address': 'Nepodařilo se odvodit adresu',
				'private-keys-warning': 'UPOZORNĚNÍ: Nepoužívejte s touto aplikací soukromé klíče!',
			},
			'es': {
				'settings.addressIndex.label': 'Indice de direcciones',
				'settings.addressIndex.integer-required': 'Debe ser un entero',
				'settings.addressIndex.greater-than-or-equal-zero': 'Debe ser mayor o igual que cero',
				'settings.extendedPublicKey.label': 'Clave Pública Extendida',
				'incorrect-number-of-bytes': 'Número incorrecto de bytes',
				'invalid-checksum': 'Suma de comprobación inválida',
				'invalid-derivation-scheme': 'Esquema de derivación no válido',
				'invalid-network-byte': 'Byte de red inválido',
				'invalid-parent-fingerprint': 'La huella paterna no es válida',
				'index-must-be-an-integer': 'El índice debe ser un número entero',
				'index-must-be-less-than': 'El índice debe ser menor que 2^32',
				'index-no-hardened': 'Las claves secundarias reforzadas no son compatibles',
				'failed-to-derive-address': 'No se pudo derivar la dirección',
				'private-keys-warning': '¡ADVERTENCIA: NO utilice claves privadas en esta aplicación!',
			},
			'fr': {
				'settings.addressIndex.label': 'Indice d\'adresse',
				'settings.addressIndex.integer-required': 'Doit être un entier',
				'settings.addressIndex.greater-than-or-equal-zero': 'Doit être supérieur ou égal à zéro',
				'settings.extendedPublicKey.label': 'Clé publique étendue',
				'incorrect-number-of-bytes': 'Nombre incorrect d\'octets',
				'invalid-checksum': 'Somme de contrôle invalide',
				'invalid-derivation-scheme': 'Schéma de dérivation invalide',
				'invalid-network-byte': 'Octet réseau non valide',
				'invalid-parent-fingerprint': 'Empreinte parentale invalide',
				'index-must-be-an-integer': 'L\'index doit être un nombre entier',
				'index-must-be-less-than': 'L\'index doit être inférieur à 2^32',
				'index-no-hardened': 'Les clés enfants durcies ne sont pas prises en charge',
				'failed-to-derive-address': 'Impossible de dériver l\'adresse',
				'private-keys-warning': 'AVERTISSEMENT: N\'utilisez pas de clés privées avec cette application!',
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
					this.decodeExtendedPublicKey(value, cb);
				},
				onChange: function() {
					this.renderSampleAddresses();
				},
				actions: [
					{
						name: 'camera',
						fn: function(value, cb) {
							app.device.scanQRCodeWithCamera(cb);
						}
					}
				]
			},
			{
				name: 'addressIndex',
				label: function() {
					return app.i18n.t('bitcoin.settings.addressIndex.label');
				},
				type: 'number',
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
				},
				onChange: function() {
					this.renderSampleAddresses();
				}
			},
			{
				name: 'derivationScheme',
				type: 'text',
				visible: false,
				default: 'm/0/n',
			}
		],

		/*
			Network constants.
		*/
		network: {
			wif: '80',
			p2pkh: '00',
			p2sh: '05',
			bech32: 'bc',
			/*
				Extended-key constants. See:
				https://github.com/spesmilo/electrum-docs/blob/master/xpub_version_bytes.rst
				https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
				https://github.com/bitcoin/bips/blob/master/bip-0049.mediawiki
				https://github.com/bitcoin/bips/blob/master/bip-0084.mediawiki
			*/
			xpub: {
				'p2pkh': [
					'0488b21e',// xpub
				],
				'p2wpkh-p2sh': [
					'049d7cb2',// ypub
				],
				'p2wsh-p2sh': [
					'0295b43f',// Ypub
				],
				'p2wpkh': [
					'04b24746',// zpub
				],
				'p2wsh': [
					'02aa7ed3',// Zpub
				],
			},
			xprv: {
				'p2pkh': [
					'0488ade4',// xprv
				],
				'p2wpkh-p2sh': [
					'049d7878',// yprv
				],
				'p2wsh-p2sh': [
					'0295b005',// Yprv
				],
				'p2wpkh': [
					'04b2430c',// zprv
				],
				'p2wsh': [
					'02aa7a99',// Zprv
				],
			},
		},

		worker: app.createWorker('workers/bitcoin.js'),

		ctApiSubscriptionId: null,
		sampleAddressesView: null,

		onSettingsRender: function() {
			this.renderSampleAddresses();
		},

		renderSampleAddresses: function() {

			clearTimeout(this.renderSampleAddressesTimeout);

			this.renderSampleAddressesTimeout = _.delay(_.bind(function() {

				this.generateSampleAddresses(_.bind(function(error, addresses) {

					if (this.sampleAddressesView) {
						this.sampleAddressesView.close();
						this.sampleAddressesView = null;
					}

					if (error) {
						return app.log(error);
					}

					var $target = $(':input[name="' + this.ref + '.addressIndex"]');
					var view = this.sampleAddressesView = new app.views.SampleAddresses();
					$target.after(view.el);
					view.options.addresses = addresses;
					view.render();

				}, this));

			}, this), 100);
		},

		generateSampleAddresses: function(cb) {

			var extendedPublicKey = app.settings.get(this.ref + '.extendedPublicKey');
			var startIndex = parseInt(app.settings.get(this.ref + '.addressIndex') || '0');
			var derivationScheme = app.settings.get(this.ref + '.derivationScheme');
			var sampleAddressesCacheKey = extendedPublicKey + '-' + startIndex + '-' + derivationScheme;
			var sampleAddresses = app.cache.get(sampleAddressesCacheKey);

			if (sampleAddresses) {
				return cb(null, sampleAddresses);
			}

			var iteratee = _.bind(function(index, next) {
				var addressIndex = startIndex + index;
				this.deriveAddress(extendedPublicKey, derivationScheme, addressIndex, function(error, address) {
					if (error) return next(error);
					next(null, {
						index: addressIndex,
						address: address,
					});
				});
			}, this);

			async.times(app.config.numberOfSampleAddressesToShow, iteratee, function(error, addresses) {
				if (error) return cb(error);
				app.cache.set(sampleAddressesCacheKey, addresses);
				cb(null, addresses);
			});
		},

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
					amount: amount,
					uri: uriScheme + ':' + address + '?amount=' + amount,
					data: {
						address: address,
					},
				};

				cb(null, paymentRequest);
			});
		},

		incrementAddressIndex: function(cb) {

			var settingPath = this.ref + '.addressIndex';
			var index = parseInt(app.settings.get(settingPath) || '0');
			var nextIndex = index + 1;
			app.settings.set(settingPath, nextIndex.toString());
			// Defer the callback function so that it is async.
			_.defer(cb);
		},

		deriveAddress: function(extendedPublicKey, derivationScheme, addressIndex, cb) {

			var ref = this.ref;
			var network = this.network;
			var deriveLastParentExtendedPublicKey = _.bind(this.deriveLastParentExtendedPublicKey, this);
			var deriveChildKeyAtIndex = _.bind(this.deriveChildKeyAtIndex, this);
			var encodePublicKey = _.bind(this.encodePublicKey, this);

			async.seq(
				deriveLastParentExtendedPublicKey,
				function(lastParentExtendedPublicKey, next) {
					deriveChildKeyAtIndex(lastParentExtendedPublicKey, addressIndex, network, next);
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

			var network = this.network;
			var deriveChildKeyAtIndex = _.bind(this.deriveChildKeyAtIndex, this);
			var indexes = this.parseDerivationScheme(derivationScheme);

			async.until(function() { return !(indexes.length > 0); }, function(next) {

				var index = indexes.shift();
				var extendedKey = lastParentExtendedPublicKey || extendedPublicKey;

				deriveChildKeyAtIndex(extendedKey, index, network, function(error, result) {

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

		decodeExtendedPublicKey: function(extendedPublicKey, cb) {

			var ref = this.ref;
			this.worker.call('decodeExtendedPublicKey', [extendedPublicKey, this.network], function(error) {
				if (error) {
					error = app.i18n.t(ref + '.' + error);
					return cb(error);
				}
				cb.apply(undefined, arguments);
			});
		},

		deriveChildKeyAtIndex: function(extendedPublicKey, index, network, cb) {

			var ref = this.ref;
			this.worker.call('deriveChildKeyAtIndex', [extendedPublicKey, index, network], function(error) {
				if (error) {
					error = app.i18n.t(ref + '.' + error);
					return cb(error);
				}
				cb.apply(undefined, arguments);
			});
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

			network || (network = this.network);
			var hash = this.hash160(publicKey);
			var version = network.p2pkh;
			var checksum = this.sha256sha256(version + hash).substr(0, 8);
			return bs58.encode(Buffer.from(version + hash + checksum, 'hex'));
		},

		listenForPayment: function(paymentRequest, cb) {

			var address = paymentRequest.data && paymentRequest.data.address;
			var amount = paymentRequest.amount;
			var rate = paymentRequest.rate;
			var decimals = this.numberFormat.decimals;
			var cryptoAmount = app.models.PaymentRequest.prototype.convertToCryptoAmount(amount, rate, decimals);
			var amountReceived = new BigNumber('0');

			var done = _.bind(function(error, wasReceived) {

				// Always stop listening for payment.
				this.stopListeningForPayment();

				if (error) {
					// Don't increment the address index in case of an error.
					return cb(error);
				}

				// A payment was received, so increment the address index.
				this.incrementAddressIndex(function() {
					cb(null, wasReceived);
				});

			}, this);

			var channel = 'address-balance-updates?' + querystring.stringify({
				address: address,
				method: this.ref,
			});

			this.ctApiSubscriptionId = app.services.ctApi.subscribe(channel, function(tx) {

				// The amount in the tx object is in satoshis.
				// Divide by 100 million to get the amount in whole bitcoin.
				var txAmountReceived = (new BigNumber(tx.amount_received)).dividedBy(100000000);
				amountReceived = amountReceived.plus(txAmountReceived);

				if (amountReceived.isGreaterThanOrEqualTo(cryptoAmount)) {
					return done(null, true/* wasReceived */);
				}

				// Continue listening..
			});
		},

		stopListeningForPayment: function() {

			app.services.ctApi.unsubscribe(this.ctApiSubscriptionId);
		}

	});

})();
