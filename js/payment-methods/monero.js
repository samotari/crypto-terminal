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

		lang: {
			'en': {
				'settings.public-address.label': 'Public Address',
				'settings.public-address.invalid': 'Invalid public address',
				'settings.private-view-key.label': 'Private View Key',
				'settings.private-view-key.invalid': 'Invalid private view key',
				'payment-request.public-address-required': 'Public address is required to generate a payment request',
				'invalid-payment-request': 'Invalid payment request',
				'invalid-address-length': 'Invalid address length',
			}
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
					if (!app.paymentMethods.monero.validatePublicAddress(value)) {
						throw new Error(app.i18n.t('monero.settings.public-address.invalid'));
					}
				}
			},
			{
				name: 'privateViewKey',
				label: function() {
					return app.i18n.t('monero.settings.private-view-key.label');
				},
				type: 'text',
				required: true,
				validate: function(value) {
					if (!app.paymentMethods.monero.validatePrivateViewKey(value)) {
						throw new Error(app.i18n.t('monero.settings.private-view-key.invalid'));
					}
				}
			}
		],

		networks: [
			{
				name: 'mainnet',
				version: 0x12
			},
			{
				name: 'testnet',
				version: 0x35
			},
		],

		getNetwork: function(version) {

			return _.find(this.networks, function(network) {
				return version === Buffer([network.version]).toString('hex');
			});
		},

		getNetworkName: function() {

			var publicAddress = app.settings.get('monero.publicAddress');
			var hex = this.addressToHex(publicAddress);
			var version = hex.substr(0, 2);
			var network = this.getNetwork(version);
			return network.name;
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
		validatePublicAddress: function(publicAddress) {

			if (!_.isString(publicAddress) || publicAddress.length !== 95) {
				return false;
			}

			var hex = this.addressToHex(publicAddress);
			var version = hex.substr(0, 2);

			if (!this.getNetwork(version)) {
				// Invalid network version byte.
				return false;
			}

			var publicSpendKey = hex.substr(2, 64);
			var publicViewKey = hex.substr(66, 64);
			var checksum = hex.substr(130, 8);
			var hash = keccak256(Buffer.from(version + publicSpendKey + publicViewKey, 'hex'));
			if (hash.substr(0, 8) !== checksum) {
				// Invalid checksum.
				return false;
			}

			// If we got this far, it's valid.
			return true;
		},

		/*
			Monero addresses are base58 encoded in blocks instead of all at once. See:
			https://monero.stackexchange.com/questions/6049/why-monero-address-is-converted-to-base-58-in-blocks-instead-of-all-at-once
		*/
		addressToHex: function(address) {

			var decoded = '';
			var fullEncodedBlockSize = 11;
			var encodedBlockSizes = [0, 2, 3, 5, 6, 7, 9, 10, 11];
			var fullBlockCount = Math.floor(address.length / fullEncodedBlockSize);
			var lastBlockSize = address.length % fullEncodedBlockSize;
			var lastBlockDecodedSize = encodedBlockSizes.indexOf(lastBlockSize);
			if (lastBlockDecodedSize < 0) {
				throw new Error(app.i18n.t('monero.invalid-address-length'));
			}
			for (var index = 0; index < fullBlockCount; index++) {
				decoded += bs58.decode(
					address.substr(
						index * fullEncodedBlockSize,
						fullEncodedBlockSize
					)
				).toString('hex');
			}
			if (lastBlockSize > 0) {
				decoded += bs58.decode(
					address.substr(fullBlockCount * fullEncodedBlockSize)
				).toString('hex');
			}
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

					var address = app.settings.get('monero.publicAddress');

					if (!address) {
						throw new Error(app.i18n.t('monero.payment-request.public-address-required'));
					}

					var paymentId = this.generatePaymentId();
					var parameters = {
						tx_payment_id: paymentId,
						tx_amount: amount
					};

					var paymentRequest = {
						address: address,
						amount: amount,
						uri: address + '?' + querystring.stringify(parameters),
						data: {
							paymentId: paymentId
						}
					};

					console.log(paymentRequest);

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
		generatePaymentId: function() {

			var randomString = app.util.generateRandomString(32);
			var paymentId = '';
			for (var index = 0; index < randomString.length; index++ ) {
				paymentId += randomString.charCodeAt(index).toString(16);
			}
			return paymentId;
		},

		getExchangeRates: function(cb) {

			// First get the currency rates for bitcoin.
			app.paymentMethods.bitcoin.getExchangeRates(function(error, btcRates) {

				if (error) {
					return cb(error);
				}

				// Then get the bitcoin->monero rate.
				$.get('https://poloniex.com/public?command=returnTicker').then(function(poloniex) {

					var xmrToBtcRate = new BigNumber(poloniex.BTC_XMR.last);
					var rates = {};

					// Convert from Fiat->BTC rate to Fiat->XMR.
					_.each(btcRates, function(btcRate, code) {
						code = code.toUpperCase();
						if (_.contains(app.config.supportedDisplayCurrencies, code)) {
							rates[code] = (new BigNumber(btcRate)).times(xmrToBtcRate).toString();
						}
					});

					cb(null, rates);

				}).fail(cb);
			});
		},

		checkPaymentReceived: function(paymentRequest, cb) {

			_.defer(_.bind(function() {

				var amount = paymentRequest.amount;
				var paymentId = paymentRequest.data.paymentId;

				this.getTransactions(_.bind(function(error, txs) {

					if (error) {
						return cb(error);
					}

					// Filter out transactions that don't have the correct payment ID.
					txs = _.filter(txs, function(tx) {
						return !!tx.payment_id && tx.payment_id === paymentId;
					});

					// Check the remaining transactions.
					async.map(txs, _.bind(function(tx, nextTx) {
						this.checkTransaction(tx, function(error, outputs) {
							if (error) {
								console.log(error);
							}
							if (outputs) {
								tx.outputs = outputs;
							}
							nextTx(null, tx);
						});
					}, this), function(error, txs) {

						if (error) {
							return cb(error);
						}

						try {
							var amountReceived = (new BigNumber('0'))
							_.each(txs, function(tx) {
								_.each(tx.outputs, function(output) {
									amountReceived = amountReceived.plus(output.amount);
								});
							});
							amountReceived = amountReceived.times('10e-12');
						} catch (error) {
							return cb(error);
						}

						var wasReceived = amountReceived.isGreaterThanOrEqualTo(amount);
						cb(null, wasReceived, amountReceived.toString());
					});
				}, this));
			}, this));
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

			var uri = this.getBlockExplorerUrl('/api/outputs');
			uri += '?' + querystring.stringify({
				txhash: tx.tx_hash,
				address: app.settings.get('monero.publicAddress'),
				viewkey: app.settings.get('monero.privateViewKey'),
				txprove: 0,
			});
			$.get(uri).then(function(result) {
				var outputs = result && result.data && result.data.outputs || [];
				outputs = _.filter(outputs, function(output) {
					return output.match === true;
				});
				cb(null, outputs);
			}).fail(cb);
		},

		getTransactions: function(cb) {

			async.parallel({
				confirmed: _.bind(this.getRecentConfirmedTransactions, this),
				mempool: _.bind(this.getMemPoolTransactions, this),
			}, function(error, results) {

				if (error) {
					return cb(error);
				}

				var txs = [];
				txs.push.apply(txs, results.confirmed);
				txs.push.apply(txs, results.mempool);
				cb(null, txs);
			});
		},

		getRecentConfirmedTransactions: function(cb) {

			var uri = this.getBlockExplorerUrl('/api/transactions');
			$.get(uri).then(function(result) {
				var txs = [];
				_.each(result.data.blocks, function(block) {
					txs.push.apply(txs, block.txs);
				});
				cb(null, txs);
			}).fail(cb);
		},

		getMemPoolTransactions: function(cb) {

			var uri = this.getBlockExplorerUrl('/api/mempool');
			$.get(uri).then(function(result) {
				cb(null, result.data.txs);
			}).fail(cb);
		}
	});
})();
