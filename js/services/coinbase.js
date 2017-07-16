var app = app || {};

app.services = app.services || {};

app.services.coinbase = (function() {

	'use strict';

	return {

		getExchangeRates: function(currency, cb) {

			var uri = 'https://api.coinbase.com/v2/exchange-rates';
			uri += '?currency=' + encodeURIComponent(currency);

			$.get(uri).then(function(result) {

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
