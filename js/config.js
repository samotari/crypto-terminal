var app = app || {};

app.config = (function() {

	'use strict';

	var config = {
		debug: false,
		supportEmail: 'cryptoterminal.eu@gmail.com',
		cache: {
			onAppStartClearOlderThan: 86400000,// milliseconds
		},
		ctApi: _.extend({
			primusPath: '/primus',
			exchangeRates: {
				timeout: 10000,
			},
		}, app.config.ctApi),
		sqlite: {
			name: 'crypto-terminal.db',
			location: 'default',
			uniqueId: {
				length: 20,
				charset: 'abcdefghijklmnopqrstuvqxyzABCDEFGHIJKLMNOPQRSTUVQXYZ1234567890-_',
			},
		},
		qrCodes: {
			errorCorrectionLevel: 'M',
			margin: 0,
		},
		defaultLocale: 'en',
		numberFormats: {
			default: {
				BigNumber: {
					FORMAT: {
						decimalSeparator: '.',
						groupSeparator: ',',
						groupSize: 3,
					},
				},
				decimals: 2,
			},
			'CZK': {
				BigNumber: {
					FORMAT: {
						decimalSeparator: ',',
						groupSeparator: ' ',
						groupSize: 3,
					},
				},
				decimals: 2,
			},
		},
		numberPad: {
			keysMaxLength: 12,
		},
		screenSaver: {
			idleTime: 3 * 60 * 1000,
		},
		touch: {
			quick: {
				// Maximum time between touchstart and touchend; milliseconds.
				maxTime: 300,
				// Maximum percent of screen traveled for emitting "click" event.
				maxMovement: 2.5,
			},
			long: {
				// Delay before emitting "longtouchstart" event; milliseconds.
				delay: 450,
			},
			swipe: {
				minSpeed: 0.0025,// % of screen width / millisecond
				minMovementX: 12,// % screen width
				tolerance: 4,// % screen width
			},
		},
		// Preset amounts are displayed on the #pay screen as buttons.
		presets: {
			// Example:
			// 'CZK': ['150', '200']
		},
		numberOfSampleAddressesToShow: 5,
		settingsPin: {
			minLength: 1,
			unlockTime: 5 * 60 * 1000,
		},
		paymentRequests: {
			timeout: 5 * 60 * 1000,
			saveDelay: 5000,
		},
		paymentHistory: {
			list: {
				limit: 30,
			}
		},
		settings: [
			{
				name: 'debug',
				visible: false,
				default: false,
			},
			{
				name: 'developer',
				visible: false,
				default: false,
			},
			{
				name: 'getting-started-complete',
				visible: false,
				default: false,
			},
			{
				name: 'configurableCryptoCurrencies',
				visible: false,
				default: [],
			},
			{
				name: 'displayCurrency',
				label: function() {
					return app.i18n.t('settings.display-currency.label');
				},
				type: 'select',
				default: 'BTC',
				required: true,
				options: function() {
					var supportedDisplayCurrencies = app.util.getSupportedDisplayCurrencies();
					var sticky = ['BTC', 'BTX', 'CZK', 'EUR', 'GBP', 'LTC', 'USD', 'XMR'];
					var rest = _.difference(supportedDisplayCurrencies, sticky);
					return _.map([].concat(sticky, [''], rest), function(code) {
						return {
							key: code,
							label: code,
							disabled: !code,
						};
					});
				},
			},
			{
				name: 'dateFormat',
				label: function() {
					return app.i18n.t('settings.date-format.label');
				},
				type: 'select',
				required: true,
				options: function() {
					return [
						{
							key: 'DD/MM/YYYY hh:mm:ss',
							label: moment().format('DD/MM/YYYY hh:mm:ss')
						},
						{
							key: 'MMMM Do YYYY, h:mm:ss A',
							label: moment().format('MMMM Do YYYY, h:mm:ss A')
						},
						{
							key: 'lll',
							label: moment().format('lll')
						},
						{
							key: 'LLLL',
							label: moment().format('LLLL')
						},
					];
				},
			},
			{
				name: 'inAppAudio',
				label: function() {
					return app.i18n.t('settings.in-app-audio.label');
				},
				description: function() {
					return app.i18n.t('settings.in-app-audio.description');
				},
				type: 'checkbox',
				default: true,
			},
		],
		recommendations: {
			hardwareWallets: [
				{
					name: 'Trezor',
					url: 'https://shop.trezor.io?a=cryptoterminal.eu',
				},
				{
					name: 'Ledger Wallet',
					url: 'https://www.ledgerwallet.com/r/285ab5ed6cb2',
				},
			],
			mobileWallets: {
                                android: [
                                        {
                                                name: 'Coinomi',
                                                paymentMethods: ['bitcoinTestnet', 'bitcoin', 'bitcore', 'litecoin'],
                                                url: 'https://play.google.com/store/apps/details?id=com.coinomi.wallet',
                                        },
                                        {
                                                name: 'Eclair Wallet',
                                                paymentMethods: ['bitcoinLightning'],
                                                url: 'https://play.google.com/store/apps/details?id=fr.acinq.eclair.wallet.mainnet2',
                                        },
                                        {
                                                name: 'Jaxx Liberty',
                                                paymentMethods: ['bitcoin', 'bitcore', 'litecoin'],
                                                url: 'https://play.google.com/store/apps/details?id=com.liberty.jaxx',
                                        },
                                        {
                                                name: 'Monerujo',
                                                paymentMethods: ['monero'],
                                                url: 'https://play.google.com/store/apps/details?id=com.m2049r.xmrwallet',
                                        },
                                        {
                                                name: 'Samourai Wallet',
                                                paymentMethods: ['bitcoin'],
                                                url: 'https://play.google.com/store/apps/details?id=com.samourai.wallet',
                                        },
                                        {
                                                name: 'ZelCore',
                                                paymentMethods: ['bitcoin', 'bitcore', 'litecoin'],
                                                url: 'https://play.google.com/store/apps/details?id=com.zelcash.zelcore',
                                        },
				],
                                ios: [
                                        {
                                                name: 'BRD (formerly "BreadWallet")',
                                                paymentMethods: ['bitcoin'],
                                                url: 'https://play.google.com/store/apps/details?id=com.breadwallet',
                                        },
                                        {
                                                name: 'Cake Wallet',
                                                paymentMethods: ['monero'],
                                                url: 'https://itunes.apple.com/us/app/cake-wallet-for-xmr-monero/id1334702542',
                                        },
                                        {
                                                name: 'Coinomi',
                                                paymentMethods: ['bitcoinTestnet', 'bitcoin', 'bitcore', 'litecoin'],
                                                url: 'https://itunes.apple.com/us/app/coinomi-wallet/id1333588809?mt=8',
                                        },
                                        {
                                                name: 'Jaxx Liberty',
                                                paymentMethods: ['bitcoin', 'bitcore', 'litecoin'],
                                                url: 'https://itunes.apple.com/us/app/jaxx-liberty/id1435383184?ls=1&mt=8',
                                        },
                                        {
                                                name: 'LoafWallet',
                                                paymentMethods: ['litecoin'],
                                                url: 'https://itunes.apple.com/us/app/loafwallet/id1119332592?ls=1&mt=8',
                                        },
                                        {
                                                name: 'ZelCore',
                                                paymentMethods: ['bitcoin', 'bitcore', 'litecoin'],
                                                url: 'https://itunes.apple.com/us/app/zelcore/id1436296839?mt=8',
                                        },
				],
			},
		},
	};

	config.settings = _.map(config.settings, function(setting) {
		return _.extend({}, setting, {
			visible: setting.visible !== false,
		});
	});

	_.each(app.paymentMethods, function(paymentMethod) {
		if (paymentMethod.numberFormat) {
			config.numberFormats[paymentMethod.code] = paymentMethod.numberFormat;
		}
	});

	return config;

})();
