var app = app || {};

app.paymentMethods = app.paymentMethods || {};

app.paymentMethods.bitcoinTestnet = (function() {

	'use strict';

	return app.paymentMethods.bitcoin.extend({

		// The name of the cryptocurrency shown in the UI:
		label: 'Bitcoin (testnet)',

		// The exchange symbol:
		code: 'BTC',

		// Used internally to reference itself:
		ref: 'bitcoinTestnet',

		// Used for chain.so API requests:
		chainSoCode: 'BTCTEST',

		networks: [
			{
				// Pay to public key hash:
				p2pkh: '6f',
				// Pay to script hash:
				p2sh: 'c4',
				bip32: {
					public: '043587cf',
					private: '04358394',
				},
			},
			{
				// Pay to public key hash:
				p2pkh: '6f',
				// Pay to script hash:
				p2sh: 'c4',
				bip32: {
					public: '0488b21e',
					private: '0488ade4',
				},
			},
		],

	});

})();
