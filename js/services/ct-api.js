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

		getMoneroMemPoolTransactions: function(networkName, cb) {
			var uri = this.getUri('/api/v1/monero/mempool', { network: networkName });
			$.get(uri).then(function(result) {
				cb(null, result);
			}).catch(cb);
		},

		getMoneroConfirmedTransactions: function(networkName, cb) {
			var uri = this.getUri('/api/v1/monero/transactions', { network: networkName });
			$.get(uri).then(function(result) {
				cb(null, result);
			}).catch(cb);
		},

		getMoneroOutputs: function(networkName, txObject, cb) {

			var uri = this.getUri('/api/v1/monero/outputs', { network: networkName });
			uri += '?' + querystring.stringify(txObject);
			$.get(uri).then(function(result) {
				cb(null, result);
			}).catch(cb)
		}
	};

})();