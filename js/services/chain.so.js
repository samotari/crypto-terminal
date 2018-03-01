var app = app || {};

app.services = app.services || {};

app.services['chain.so'] = (function() {

	'use strict';

	return {

		hostname: 'https://chain.so',

		getUri: function(uri) {

			return this.hostname + uri;
		},

		getTransactionsReceivedByAddress: function(address, currency, cb) {

			var uri = this.getUri('/api/v2/get_tx_received');
			uri += '/' + encodeURIComponent(currency);
			uri += '/' + encodeURIComponent(address);
			$.get(uri).then(function(result) {
				cb(null, result.data.txs);
			}).fail(cb);
		}
	};

})();