var app = app || {};

app.services = app.services || {};

app.services.blockexplorer = (function() {

	'use strict';

	return {

		getUriBaseOnNetwork: function(networkName) {
			switch (networkName) {
				case 'testnet':
					return 'https://testnet.blockexplorer.com';
				default:
					return 'https://blockexplorer.com';
			}
		},

		// argObj as {address, networkName}
		getTotalReceiveByAddressAndNetworkName: function(argObj, cb) {

			var uri = app.services.blockexplorer.getUriBaseOnNetwork(argObj.networkName);

			uri += '/api/addr/' + encodeURIComponent(argObj.address) + '/totalReceived';

			$.get(uri).then(function(result) {

				try {
					var totalReceived = new BigNumber(result);
				} catch (error) {
					return cb(error);
				}

				cb(null, totalReceived);

			}).fail(cb);
		},

		// argObj as {address, networkName, amount}
		getUnconfirmedBalance: function(argObj, cb) {

			var uri = app.services.blockexplorer.getUriBaseOnNetwork(argObj.networkName);

			uri += '/api/addr/' + encodeURIComponent(argObj.address) + '/unconfirmedBalance';

			$.get(uri).then(function(result) {

				try {
					var amountReceived = new BigNumber(result);
					// Convert to BTC from satoshis.
					amountReceived = amountReceived.dividedBy('100000000');
				} catch (error) {
					return cb(error);
				}

				var wasReceived = amountReceived.greaterThanOrEqualTo(argObj.amount);
				cb(null, wasReceived, amountReceived);

			}).fail(cb);
		}
	};

})();