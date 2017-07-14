var app = app || {};

app.paymentMethods = app.paymentMethods || {};

app.paymentMethods.bitcoin = (function() {

	'use strict';

	return {

		label: 'Bitcoin',
		code: 'BTC',

		settings: [
			{
				name: 'xpub',
				label: 'Master Public Key',
				type: 'text',
				required: true,
				validate: function(value) {
					if (!bitcoin.address.fromBase58Check(value)) {
							throw new Error('Must be between 0 and 100.');
					}
				}
			},
			{
				name: 'scheme',
				label: 'Address Path',
				type: 'text',
				default: 'm/0/n',
				required: true
			}
		],

		generatePaymentRequest: function(amount, cb) {

			this.getPaymentAddress(function(error, address) {

				if (error) {
					return cb(error);
				}

				var paymentRequest = 'bitcoin:' + address + '?amount=' + amount;
				cb(null, paymentRequest, address);
			});
		},

		getPaymentAddress: function(cb) {

			var index = parseInt(app.settings.get('bitcoin.lastIndex') || 0) + 1;

			this.getAddress(index, function(error, address) {

				if (error) {
					return cb(error);
				}

				app.settings.set('bitcoin.lastIndex', index).save();
				cb(null, address);
			});
		},

		getAddress: function(index, cb) {

			var xpub = app.settings.get('bitcoin.xpub');

			if (!xpub) {
				return _.defer(cb, new Error('xpub required to get bitcoin payment address'));
			}

			try {

				var scheme = app.settings.get('bitcoin.scheme');
				var node = bitcoin.HDNode.fromBase58(xpub);
				var keyPair;

				switch (scheme) {

					case 'm/0/n':
						keyPair = node.derive(0).derive(index);
						break;

					case 'n':
						keyPair = node.derive(index);
						break;
				}

				var address = keyPair.getAddress().toString();

			} catch (error) {
				return _.defer(cb, error);
			}

			_.defer(cb, null, address);
		},

		convertAmount: function(amount, fromCurrency, cb) {

			try {
				amount = new BigNumber(amount);
			} catch (error) {
				return _.defer(cb, new Error('Invalid "amount". Number expected.'));
			}

			if (!_.isString(fromCurrency)) {
				return _.defer(cb, new Error('Invalid "fromCurrency". String expected.'));
			}

			fromCurrency = fromCurrency.toUpperCase();

			this.getExchangeRates(function(error, rates) {

				if (error) {
					return cb(error);
				}

				if (_.isUndefined(rates[fromCurrency])) {
					return cb(new Error('Conversion rate not found for given currency: "' + fromCurrency + '"'));
				}

				var rate = rates[fromCurrency];
				amount = amount.dividedBy(rate);
				// Maximum of 8 decimal places.
				amount = amount.round(8);
				cb(null, amount.toString());
			});
		},

		getExchangeRates: function(cb) {

			// Get exchange rate info from Coinbase's API.
			$.get('https://api.coinbase.com/v2/exchange-rates?currency=BTC').then(function(result) {

				var rates = {};

				_.each(result.data.rates, function(rate, code) {
					code = code.toUpperCase();
					if (_.contains(app.config.supportedDisplayCurrencies, code)) {
						rates[code] = rate;
					}
				});

				cb(null, rates);

			}).fail(cb);
		}

	};

})();
