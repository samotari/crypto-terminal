var app = app || {};

app.paymentMethods = app.paymentMethods || {};

app.paymentMethods.litecoinTestnet = (function() {

	'use strict';

	return app.paymentMethods.litecoin.extend({

		// The name of the cryptocurrency shown in the UI:
		label: 'Litecoin (testnet)',

		// The exchange symbol:
		code: 'LTC',

		// Used internally to reference itself:
		ref: 'litecoinTestnet',

		// Used for chain.so API requests:
		chainSoCode: 'LTCTEST',

		/*
			Litecoin testnet network constants.

				- Public key hash:
					Used in the generation of addresses from public keys.
					(testnet) https://github.com/litecoin-project/litecore-lib/blob/9c3b2712de14335d2a953a8772aee87e23be6cf6/lib/networks.js#L158

				- Script hash:
					Used in the generation of scripting addresses from public keys.
					(testnet) https://github.com/litecoin-project/litecore-lib/blob/9c3b2712de14335d2a953a8772aee87e23be6cf6/lib/networks.js#L160

				- WIF:
					"Wallet Import Format"
					Used to encode private keys in a way to be more easily copied.
					(testnet) https://github.com/litecoin-project/litecore-lib/blob/9c3b2712de14335d2a953a8772aee87e23be6cf6/lib/networks.js#L159

				- BIP32 public/private key constants:
					Used in the generation of child addresses from master public/private keys.
					(testnet) https://github.com/litecoin-project/litecoin/blob/ba8ed3a93be7e7a97db6bc00dd7280fa2f1548bc/src/chainparams.cpp#L239-L240
		*/
		networks: [
			{
				// Pay to public key hash:
				p2pkh: '6f',
				// Pay to script hash:
				p2sh: '3a',
				bip32: {
					public: '043587cf',
					private: '04358394',
				},
			},
			/*
				Yes, two sets of network constants.

				See:
				https://www.reddit.com/r/litecoin/comments/48wd2e/why_arent_the_litecoin_bip32_serialization_values/
			*/
			{
				// Pay to public key hash:
				p2pkh: '6f',
				// Pay to script hash:
				p2sh: '3a',
				bip32: {
					public: '0488b21e',
					private: '0488ade4',
				},
			},
		],

	});

})();
