var app = app || {};

app.config = (function() {

	'use strict';

	var config = {
		primaryDisplayCurrencies: ['BTC', 'CZK', 'EUR', 'GBP', 'LTC', 'USD'],
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
		debug: false,
		primus: {
			reconnect: {
				max: 5000, // Number: The max delay before we try to reconnect.
				min: 500, // Number: The minimum delay before we try reconnect.
				retries: Infinity, // Number: How many times we should try to reconnect.
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
				limit: 999,
			},
			export: {
				storagePath: 'file:///storage/emulated/0/',
				storageDirectory: 'download',
				extension: '.csv',
				dateFormat: 'DD-MM-YYYY_HHmmss'
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
					var sticky = config.primaryDisplayCurrencies;
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
							key: 'DD/MM/YYYY HH:mm:ss',
							label: moment().format('DD/MM/YYYY HH:mm:ss')
						},
						{
							key: 'MMMM Do YYYY, H:mm:ss A',
							label: moment().format('MMMM Do YYYY, H:mm:ss A')
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
				name: 'theme',
				label: function() {
					return app.i18n.t('settings.theme.label');
				},
				type: 'select',
				default: 'default',
				required: true,
				options: function() {
					return [
						{
							key: 'default',
							label: function() {
								return app.i18n.t('settings.theme.option.default.label');
							},
						},
						{
							key: 'dark',
							label: function() {
								return app.i18n.t('settings.theme.option.dark.label');
							},
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
			{
				name: 'screenSaver',
				label: function() {
					return app.i18n.t('settings.screen-saver.label');
				},
				description: function() {
					return app.i18n.t('settings.screen-saver.description');
				},
				type: 'checkbox',
				default: false,
			},
		],
		recommendations: {
			mobileWallets: {
				android: [
					{
						name: 'Coinomi',
						paymentMethods: ['bitcoinTestnet', 'litecoin'],
						url: 'https://play.google.com/store/apps/details?id=com.coinomi.wallet',
					},
					{
						name: 'Eclair Wallet',
						paymentMethods: ['bitcoinLightning'],
						url: 'https://play.google.com/store/apps/details?id=fr.acinq.eclair.wallet.mainnet2',
					},
					{
						name: 'Samourai Wallet',
						paymentMethods: ['bitcoin'],
						url: 'https://play.google.com/store/apps/details?id=com.samourai.wallet',
					},
				],
				ios: [
					{
						name: 'BRD (formerly "BreadWallet")',
						paymentMethods: ['bitcoin'],
						url: 'https://play.google.com/store/apps/details?id=com.breadwallet',
					},
					{
						name: 'Coinomi',
						paymentMethods: ['bitcoinTestnet'],
						url: 'https://itunes.apple.com/us/app/coinomi-wallet/id1333588809?mt=8',
					},
					{
						name: 'LoafWallet',
						paymentMethods: ['litecoin'],
						url: 'https://itunes.apple.com/us/app/loafwallet/id1119332592?ls=1&mt=8',
					},
				],
			},
		},
	};

	_.each(app.paymentMethods, function(paymentMethod) {
		if (paymentMethod.numberFormat) {
			config.numberFormats[paymentMethod.code] = paymentMethod.numberFormat;
		}
	});

	return config;

})();
