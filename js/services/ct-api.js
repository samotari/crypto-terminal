var app = app || {};

app.services = app.services || {};

app.services.ctApi = (function() {

	'use strict';

	return {

		hostname: 'https://ct-api.degreesofzero.com',

		getUri: function(uri, params) {
			var url = this.hostname + uri;
			if (!_.isEmpty(params)) {
				url += '?' + querystring.stringify(params);
			}
			return url;
		},

		getExchangeRates: function(currency, cb) {

			var uri = this.getUri('/api/v1/exchange-rates', { currency: currency });
			$.get(uri).then(function(rates) {
				cb(null, rates);
			}).catch(cb);
		},
	};

})();