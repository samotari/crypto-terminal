var app = app || {};

app.paymentMethods = app.paymentMethods || {};

app.paymentMethods.bitcoinTestnet = (function() {

	'use strict';

	return app.paymentMethods.bitcoin.extend({

		enabled: function() {
			return app.isDeveloperMode();
		},

		// The name of the cryptocurrency shown in the UI:
		label: 'Bitcoin (testnet)',

		// The exchange symbol:
		code: 'BTC',

		// Used internally to reference itself:
		ref: 'bitcoinTestnet',

		/*
			Network constants.
		*/
		network: {
			bech32: 'tb',
			bip32: {
				public: 70617039,
				private: 70615956,
			},
			/*
				NOTE:
				Some wallets use the same constants as Bitcoin-Mainnet, which is why they are included here.
			*/
			extendedPublicKeyPrefixes: {
				xpub: {
					addressType: 'p2pkh',
					hex: '0488b21e',
				},
				tpub: {
					addressType: 'p2pkh',
					hex: '043587cf',
				},
				ypub: {
					addressType: 'p2wpkh-p2sh',
					hex: '049d7cb2',
				},
				upub: {
					addressType: 'p2wpkh-p2sh',
					hex: '044a5262',
				},
				Ypub: {
					addressType: 'p2wsh-p2sh',
					hex: '0295b43f',
				},
				Upub: {
					addressType: 'p2wsh-p2sh',
					hex: '024289ef',
				},
				zpub: {
					addressType: 'p2wpkh',
					hex: '04b24746',
				},
				vpub: {
					addressType: 'p2wpkh',
					hex: '045f1cf6',
				},
				Zpub: {
					addressType: 'p2wsh',
					hex: '02aa7ed3',
				},
				Vpub: {
					addressType: 'p2wsh',
					hex: '02575483',
				},
			},
			messagePrefix: "\u0018Bitcoin Signed Message:\n",
			pubKeyHash: 111,
			scriptHash: 196,
			wif: 239,
		},

		/*
			Information needed for connecting to ElectrumX servers.
		*/
		electrum: {
			defaultPorts: {
				tcp: 51001,
				ssl: 51002,
			},
			servers: [
				'electrumx.paralelnipolis.cz t51001 s51002',
				'testnet.hsmiths.com t53011 s53012',
				'hsmithsxurybd7uh.onion t53011 s53012',
				'testnet.qtornado.com s t',
				'testnet1.bauerj.eu t50001 s50002',
				'tn.not.fyi t55001 s55002',
				'bitcoin.cluelessperson.com s t',
			],
		},
	});

})();
