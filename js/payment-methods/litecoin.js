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
			wif: '80',
			p2pkh: '30',
			p2sh: '32',
			bech32: 'ltc',
			/*
				NOTE:
				Some wallets use the same constants as Bitcoin-Mainnet, which is why they are included here.
			*/
			xpub: {
				'p2pkh': [
					'0488b21e',// xpub
					'019da462',// Ltub
				],
				'p2wpkh-p2sh': [
					'049d7cb2',// ypub
					'01b26ef6',// Mtub
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
					'019d9cfe',// Ltpv
				],
				'p2wpkh-p2sh': [
					'049d7878',// yprv
					'01b26792',// Mtpv
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
	});
})();
