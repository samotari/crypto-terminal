var app = app || {};

app.paymentMethods = app.paymentMethods || {};

app.paymentMethods.litecoin = (function() {

	'use strict';

	return app.paymentMethods.bitcoin.extend({

		enabled: true,

		// The name of the cryptocurrency shown in the UI:
		label: 'Litecoin',

		// The exchange symbol:
		code: 'LTC',

		// Used internally to reference itself:
		ref: 'litecoin',

		// Used to generate a payment request URI:
		uriScheme: 'litecoin',

		/*
			Network constants.
		*/
		network: {
			bech32: 'ltc',
			bip32: {
				public: 76067358,
				private: 76066276
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
				Ltub: {
					addressType: 'p2pkh',
					hex: '019da462',
				},
				ypub: {
					addressType: 'p2wpkh-p2sh',
					hex: '049d7cb2',
				},
				Mtub: {
					addressType: 'p2wpkh-p2sh',
					hex: '01b26ef6',
				},
				Ypub: {
					addressType: 'p2wsh-p2sh',
					hex: '0295b43f',
				},
				zpub: {
					addressType: 'p2wpkh',
					hex: '04b24746',
				},
				Zpub: {
					addressType: 'p2wsh',
					hex: '02aa7ed3',
				},
			},
			messagePrefix: "\u0018Litecoin Signed Message:\n",
			pubKeyHash: 48,
			scriptHash: 50,
			wif: 176,
		},

		/*
			Information needed for connecting to ElectrumX servers.
		*/
		electrum: {
			defaultPorts: {
				tcp: 50001,
				ssl: 50002,
			},
			servers: [
				'ex.lug.gs s444',
				'electrum-ltc.bysh.me s t',
				'electrum-ltc.ddns.net s t',
				'electrum-ltc.wilv.in s t',
				'electrum.cryptomachine.com p1000 s t',
				'electrum.ltc.xurious.com s t',
				'eywr5eubdbbe2laq.onion s50008 t50007',
			],
		},
	});
})();
