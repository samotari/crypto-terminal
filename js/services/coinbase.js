var app = app || {};

app.services = app.services || {};

app.services.coinbase = (function() {

	'use strict';

	return {

		hostname: 'https://api.coinbase.com',

		getUri: function(uri) {

			return this.hostname + uri;
		},

		getExchangeRates: function(currency, cb) {

			_.defer(_.bind(function() {

				var cacheKey = 'services.coinbase.exchange-rates.' + currency;
				var cacheMaxAge = 5 * 60 * 1000;// 5 minutes
				var fromCache = app.services.memoryCache.get(cacheKey, cacheMaxAge);

				if (fromCache) {
					return cb(null, fromCache);
				}

				var uri = this.getUri('/v2/exchange-rates');

				uri += '?' + querystring.stringify({
					currency: currency,
				});

				$.get(uri).then(function(result) {

					var rates = {};

					_.each(result.data.rates, function(rate, code) {
						code = code.toUpperCase();
						if (_.contains(app.config.supportedDisplayCurrencies, code)) {
							rates[code] = rate;
						}
					});

					app.services.memoryCache.set(cacheKey, rates);

					cb(null, rates);

				}).fail(cb);
			}, this));
		}
	};

})();
