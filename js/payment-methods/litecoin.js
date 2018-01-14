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

				var matches = paymentRequest.match(/litecoin:([a-zA-Z0-9]+)\?amount=([0-9\.]+)/);

				if (!matches) {
					return cb(new Error(app.i18n.t('litecoin.invalid-payment-request')));
				}

				var address = matches[1];
				var amount = matches[2];
				var network = this.getNetworkName();

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
		}
	});
})();
