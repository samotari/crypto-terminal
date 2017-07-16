var app = app || {};

app.paymentMethods = app.paymentMethods || {};

app.paymentMethods.bitcoin = (function() {

	'use strict';

	return app.abstracts.PaymentMethod.extend({

		label: 'Bitcoin',
		code: 'BTC',

		settings: [
			{
				name: 'xpub',
				label: 'Master Public Key',
				type: 'text',
				required: true,
				validate: function(value) {
					if (!app.paymentMethods.bitcoin.getHDNodeInstance(value)) {
						throw new Error('Invalid master public key');
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
				var node = this.getHDNodeInstance(xpub);

				if (!node) {
					throw new Error('Invalid bitcoin master public key.');
				}

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

		getHDNodeInstance: function(xpub) {
			var node;
			_.some(['bitcoin', 'testnet'], function(network) {
				// Try each network until we find one that works with the given master public key.
				try {
					node = bitcoin.HDNode.fromBase58(xpub, bitcoin.networks[network]);
				} catch (error) {
					// Do nothing with this error.
					// But return FALSE so that the loop continues.
					return false;
				}
				// Return TRUE to stop the loop.
				return true;
			});
			return node || null;
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
	});
})();
