var app = app || {};

app.paymentMethods = app.paymentMethods || {};

app.paymentMethods.litecoin = (function() {

	'use strict';

	return app.paymentMethods.bitcoin.extend({

		// The name of the cryptocurrency shown in the UI:
		label: 'Litecoin',

		// The exchange symbol:
		code: 'LTC',

		// Used internally to reference itself:
		ref: 'litecoin',

		settings: [
			{
				name: 'xpub',
				label: function() {
					return app.i18n.t('litecoin.settings.xpub.label');
				},
				type: 'text',
				required: true,
				validate: function(value) {
					if (!app.paymentMethods.litecoin.prepareHDNodeInstance(value)) {
						throw new Error(app.i18n.t('litecoin.settings.xpub.invalid'));
					}
				},
				beforeSaving: function(data, cb) {

					this.getFirstIndexOfGap(data[this.ref + '.xpub'], _.bind(function(error, firstIndexOfGap) {

						if (error) {
							console.log(app.i18n.t(currency + 'litecoin.settings.error-beforesaving'));
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
		networks: [
			_.extend({}, bitcoin.networks.litecoin, {
				name: 'mainnet',
				bip32: {
					public: (new Buffer([0x04, 0x88, 0xB2, 0x1E])).readUInt32BE(0),
					private: (new Buffer([0x04, 0x88, 0xAD, 0xE4])).readUInt32BE(0)
				},
				pubKeyHash: 0x30,
				scriptHash: 0x32,
				wif: 0xB0
			}),
			/*
				Yes, two "mainnet" networks.
				There are two different sets of bip32 public/private values for litecoin.

				See:
				https://www.reddit.com/r/litecoin/comments/48wd2e/why_arent_the_litecoin_bip32_serialization_values/
			*/
			_.extend({}, bitcoin.networks.litecoin, {
				name: 'mainnet',
				pubKeyHash: 0x30,
				scriptHash: 0x32,
				wif: 0xB0
			}),
			_.extend({}, bitcoin.networks.litecoin, {
				name: 'testnet',
				bip32: {
					public: (new Buffer([0x04, 0x35, 0x87, 0xCF])).readUInt32BE(0),
					private: (new Buffer([0x04, 0x35, 0x83, 0x94])).readUInt32BE(0)
				},
				pubKeyHash: 0x6F,
				scriptHash: 0x3A,
				wif: 0xEF
			})
		],

		checkPaymentReceived: function(paymentRequest, cb) {

			_.defer(_.bind(function() {

				var address = paymentRequest.address;
				var amount = paymentRequest.amount;
				var network = this.getNetworkName();
				var requestArr = app.util.requestArrFactory(
					[
						app.services['chain.so'].checkPaymentReceived
					],
					{address: address, amount: amount, network: network}
				)

				async.tryEach(
					requestArr,
					function(error, results) {

						if (error) {
							return cb(error);
						}

						var wasReceived = results;

						cb(null, wasReceived);
					}
				)


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
						app.services['chain.so'].getTotalReceiveByAddress
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
							var indexWasUsed = totalReceived.isGreaterThan('0');
						} catch (error) {
							return cb(error);
						}

						cb(null, indexWasUsed);

					}
				)

			}, this))
		},

	});
})();
