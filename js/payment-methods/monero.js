var app = app || {};

app.paymentMethods = app.paymentMethods || {};

app.paymentMethods.monero = (function() {

	'use strict';

	/*
		https://getmonero.org/get-started/what-is-monero/
	*/

	return app.abstracts.PaymentMethod.extend({

		// The name of the cryptocurrency shown in the UI:
		label: 'Monero',

		// The exchange symbol:
		code: 'XMR',

		// Used internally to reference itself:
		ref: 'monero',

		// Used when formatting numbers (to be displayed in the UI).
		numberFormat: {
			decimals: 12,
		},

		txsSubscriptionId: null,

		lang: {
			'en': {
				'settings.public-address.label': 'Public Address',
				'settings.private-view-key.label': 'Private View Key',
				'payment-request.public-address-required': 'Public address is required to generate a payment request',
				'invalid-checksum': 'Invalid checksum',
				'invalid-length': 'Invalid length',
				'invalid-network-byte': 'Invalid network byte',
			},
			'cs': {
				'settings.public-address.label': 'Veřejná adresa',
				'settings.private-view-key.label': 'Klíč soukromého zobrazení',
				'payment-request.public-address-required': 'Pro generování žádosti o platbu je vyžadována veřejná adresa',
				'invalid-checksum': 'Neplatný kontrolní součet',
				'invalid-length': 'Neplatná délka',
				'invalid-network-byte': 'Neplatná síťová verze',
			},
			'es': {
				'settings.public-address.label': 'Direccion publica',
				'settings.private-view-key.label': 'Clave de vista privada',
				'payment-request.public-address-required': 'Se requiere una dirección pública para generar una solicitud de pago',
				'invalid-checksum': 'Suma de comprobación inválida',
				'invalid-length': 'Longitud inválida',
				'invalid-network-byte': 'La versión de la red no es válida',
			},
			'fr': {
				'settings.public-address.label': 'Adresse publique',
				'settings.private-view-key.label': 'Clé privée',
				'payment-request.public-address-required': 'L\'adresse publique est requise pour générer une demande de paiement',
				'invalid-checksum': 'Somme de contrôle invalide',
				'invalid-length': 'Longueur invalide',
				'invalid-network-byte': 'Octet réseau non valide',
			},
		},

		settings: [
			{
				name: 'publicAddress',
				label: function() {
					return app.i18n.t('monero.settings.public-address.label');
				},
				type: 'text',
				required: true,
				validate: function(value) {
					this.validatePublicAddress(value);
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
				name: 'privateViewKey',
				label: function() {
					return app.i18n.t('monero.settings.private-view-key.label');
				},
				type: 'text',
				required: true,
				validate: function(value) {
					this.validatePrivateViewKey(value);
				},
				actions: [
					{
						name: 'camera',
						fn: function(value, cb) {
							app.device.scanQRCodeWithCamera(cb);
						}
					}
				]
			}
		],

		networks: [
			{
				name: 'mainnet',
				versions: {
					standard: 0x12,
					integrated: 0x13,
				},
			},
			{
				name: 'testnet',
				versions: {
					standard: 0x35,
					integrated: 0x13,
				},
			},
		],

		// Used to generate a payment request URI:
		uriScheme: 'monero',

		bs53: (function() {
			var alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
			return basex(alphabet);
		})(),

		getNetwork: function(version) {

			return _.find(this.networks, function(network) {
				return !!_.find(network.versions, function(_version) {
					return version === Buffer([_version]).toString('hex');
				});
			});
		},

		getNetworkName: function() {

			var publicAddress = app.settings.get(this.ref + '.publicAddress');
			var decoded = this.decodePublicAddress(publicAddress);
			return decoded.network.name;
		},

		validatePublicAddress: function(publicAddress) {

			this.decodePublicAddress(publicAddress);

			// If we got this far, it's valid.
			return true;
		},

		/*
			A monero address is as follows:
				1) (network byte) + (32-byte public spend key) + (32-byte public view key)
				2) keccak256((result from step 1))
				3) (result from step 1) + (first 4 bytes of the result from step 2)
				4) base58Encode(result from step 3)

			Sanity checks for the public address:
				* Has the correct length
				* Can base58 decode
				* Has a valid network byte
				* Checksum is correct (last four bytes from step 2 above)
				* Public view key in address pairs with private view key provided via settings.
		*/
		decodePublicAddress: function(publicAddress) {

			var hex = this.convertAddressToHex(publicAddress);
			var version = hex.substr(0, 2);
			var network = this.getNetwork(version);

			if (!network) {
				throw new Error(app.i18n.t(this.ref + '.invalid-network-byte'));
			}

			/*
				Integrated addresses:
				https://monero.stackexchange.com/questions/3179/what-is-an-integrated-address
			*/
			var isIntegrated = version === '13';
			var expectedLength = isIntegrated ? 154 : 138;

			if (hex.length !== expectedLength) {
				throw new Error(app.i18n.t(this.ref + '.invalid-length'));
			}

			var publicSpendKey = hex.substr(2, 64);
			var publicViewKey = hex.substr(66, 64);
			// Integrated addresses contain an 8-byte payment ID.
			var paymentId = isIntegrated ? hex.substr(130, 16) : '';
			var checksum = hex.substr(hex.length - 8, 8);
			var hash = keccak256(Buffer.from(version + publicSpendKey + publicViewKey + paymentId, 'hex'));

			if (hash.substr(0, 8) !== checksum) {
				throw new Error(app.i18n.t(this.ref + '.invalid-checksum'));
			}

			return {
				network: network,
				publicSpendKey: publicSpendKey,
				publicViewKey: publicViewKey,
				paymentId: paymentId || null,
			};
		},

		/*
			Monero addresses are base58 encoded in blocks instead of all at once.

			See:
			https://monero.stackexchange.com/questions/6049/why-monero-address-is-converted-to-base-58-in-blocks-instead-of-all-at-once
		*/
		convertAddressToHex: function(address) {

			var hex = '';
			var fullEncodedBlockSize = 11;
			var encodedBlockSizes = [0, 2, 3, 5, 6, 7, 9, 10, 11];
			var fullBlockCount = Math.floor(address.length / fullEncodedBlockSize);
			var lastBlockSize = address.length % fullEncodedBlockSize;
			var lastBlockDecodedSize = encodedBlockSizes.indexOf(lastBlockSize);
			if (lastBlockDecodedSize < 0) {
				throw new Error(app.i18n.t(this.ref + '.invalid-length'));
			}
			var block;
			for (var index = 0; index < fullBlockCount; index++) {
				block = address.substr(index * fullEncodedBlockSize, fullEncodedBlockSize);
				hex += this.decodeBlock(block);
			}
			if (lastBlockSize > 0) {
				block = address.substr(fullBlockCount * fullEncodedBlockSize, lastBlockSize);
				hex += this.decodeBlock(block);
			}
			return hex;
		},

		decodeBlock: function(block) {
			var decoded = this.bs53.decode(block).toString('hex');
			// Remove excess leading zeros.
			decoded = decoded.replace(/^0{2,}/, '0');
			return decoded;
		},

		validatePrivateViewKey: function(privateViewKey) {

			// !! TODO !!
			// Are there any sanity checks that can be done to validate a private view key?
			return true;
		},

		generatePaymentRequest: function(amount, cb) {

			_.defer(_.bind(function() {

				try {

					var address = app.settings.get(this.ref + '.publicAddress');

					if (!address) {
						throw new Error(app.i18n.t(this.ref + '.payment-request.public-address-required'));
					}

					var decoded = this.decodePublicAddress(address);
					// Use 32 byte payment IDs until we can properly decrypt payment IDs in transactions.
					var paymentId = decoded.paymentId || this.generatePaymentId(32);

					var uri = this.uriScheme + ':' + address + '?' + querystring.stringify({
						tx_payment_id: paymentId,
						tx_amount: amount
					});

					var paymentRequest = {
						amount: amount,
						uri: uri,
						data: {
							address: address,
							paymentId: paymentId,
						},
					};

				} catch (error) {
					return cb(error);
				}

				cb(null, paymentRequest);

			}, this));
		},

		/*
			To uniquely identify each payment request, we need a payment ID.

			See:
			https://getmonero.org/resources/moneropedia/paymentid.html
		*/
		generatePaymentId: function(length) {

			var randomString = app.util.generateRandomString(length);
			var paymentId = '';
			for (var index = 0; index < randomString.length; index++ ) {
				paymentId += randomString.charCodeAt(index).toString(16);
			}
			return paymentId;
		},

		blockExplorerHostNames: {
			mainnet: 'xmrchain.com',
			testnet: 'testnet.xmrchain.com',
		},

		getBlockExplorerUrl: function(uri) {

			var networkName = this.getNetworkName();
			var hostname = this.blockExplorerHostNames[networkName];
			return 'https://' + hostname + uri;
		},

		/*
			Checks the outputs of the transaction using our private view key.
		*/
		checkTransaction: function(tx, cb) {

			var networkName = this.getNetworkName();

			var txObject = {
				txhash: tx.tx_hash,
				address: app.settings.get(this.ref + '.publicAddress'),
				viewkey: app.settings.get(this.ref + '.privateViewKey'),
				txprove: 0,
			}

			app.services.ctApi.getMoneroOutputs(networkName, txObject, function(error, result) {
				if (error) {
					return cb(error);
				}

				var outputs = result && result.data && result.data.outputs || [];
				outputs = _.filter(outputs, function(output) {
					return output.match === true;
				});
				cb(null, outputs);
			});
		},

		checkRemainingTransactions: function(txs, cb) {

			// Check the remaining transactions.
			async.map(txs, _.bind(function(tx, nextTx) {
				this.checkTransaction(tx, function(error, outputs) {
					if (error) {
						app.log(error);
					}
					if (outputs) {
						tx.outputs = outputs;
					}
					nextTx(null, tx);
				});
			}, this), function(error, txs) {

				if (error) {
					app.log(error);
					return cb(error);
				}

				cb(null, txs);
			});
		},

		listenForPayment: function(paymentRequest, cb) {

			var networkName = this.getNetworkName();
			var amount = paymentRequest.amount;
			var rate = paymentRequest.rate;
			var decimals = this.numberFormat.decimals;
			var cryptoAmount = app.models.PaymentRequest.prototype.convertToCryptoAmount(amount, rate, decimals);
			var paymentId = paymentRequest.data.paymentId;
			var channel = 'get-monero-transactions?' + querystring.stringify({
				networkName: networkName
			});
			var stopListeningForPayment = _.bind(this.stopListeningForPayment, this);
			var checkRemainingTransactions = _.bind(this.checkRemainingTransactions, this);

			var done = _.once(function() {
				stopListeningForPayment();
				cb.apply(undefined, arguments);
			});

			var listener = _.bind(function(txs) {

				// Filter out transactions that don't have the correct payment ID.
				txs = _.filter(txs, function(tx) {
					return !!tx.payment_id && tx.payment_id === paymentId;
				});

				checkRemainingTransactions(txs, function(error, txsRemaining) {

					if (error) {
						return done(error);
					}

					try {
						var amountReceived = (new BigNumber('0'))
						_.each(txsRemaining, function(tx) {
							_.each(tx.outputs, function(output) {
								amountReceived = amountReceived.plus(output.amount);
							});
						});
						amountReceived = amountReceived.times('10e-12');
					} catch (error) {
						return done(error);
					}

					if (amountReceived.isGreaterThanOrEqualTo(cryptoAmount)) {
						// Passing transaction data so that it can be stored.
						var txData = _.chain(txs).first().pick('tx_hash').value();
						return done(null, txData);
					}

					// Continue listening..

				});

			}, this);

			app.services.ctApi.subscribe(channel, listener);
			this.listening = { channel: channel, listener: listener };
		},

		stopListeningForPayment: function() {

			if (this.listening) {
				var channel = this.listening.channel;
				var listener = this.listening.listener;
				app.services.ctApi.unsubscribe(channel, listener);
				this.listening = null;
			}
		},

	});
})();
