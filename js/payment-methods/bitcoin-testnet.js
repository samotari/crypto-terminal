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
			messagePrefix: '\x18Bitcoin Signed Message:\n',
			wif: 'ef',
			p2pkh: '6f',
			p2sh: 'c4',
			bech32: 'tb',
			/*
				NOTE:
				Some wallets use the same constants as Bitcoin-Mainnet, which is why they are included here.
			*/
			xpub: {
				'p2pkh': [
					'0488b21e',// xpub
					'043587cf',// tpub
				],
				'p2wpkh-p2sh': [
					'049d7cb2',// ypub
					'044a5262',// upub
				],
				'p2wsh-p2sh': [
					'0295b43f',// Ypub
					'024289ef',// Upub
				],
				'p2wpkh': [
					'04b24746',// zpub
					'045f1cf6',// vpub
				],
				'p2wsh': [
					'02aa7ed3',// Zpub
					'02575483',// Vpub
				],
			},
			xprv: {
				'p2pkh': [
					'0488ade4',// xprv
					'04358394',// tprv
				],
				'p2wpkh-p2sh': [
					'049d7878',// yprv
					'044a4e28',// uprv
				],
				'p2wsh-p2sh': [
					'0295b005',// Yprv
					'024285b5',// Uprv
				],
				'p2wpkh': [
					'04b2430c',// zprv
					'045f18bc',// vprv
				],
				'p2wsh': [
					'02aa7a99',// Zprv
					'02575048',// Vprv
				],
			},
		},
	});

})();
