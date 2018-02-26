var app = app || {};

app.services = app.services || {};

app.services['chain.so'] = (function() {

	'use strict';

	return {

		
		// argObj as {address, networkName, amount, currencyCode, currencyTestCode, timestamp}
		checkPaymentReceived: function(argObj, cb) {

			app.services['chain.so'].getTotalReceivedByAddressSince(argObj, function(error, amountReceived) {

				if (error) {
					return cb(error);
				}

				var wasReceived = amountReceived.isGreaterThanOrEqualTo(argObj.amount);

				cb(null, wasReceived);
			})

		},

		// argObj as {address, networkName, currencyCode, currencyTestCode}
		getTotalReceivedByAddress: function(argObj, cb) {

			/*
				For API details:
				https://chain.so/api#get-balance
			*/
			var uri = 'https://chain.so/api/v2/get_address_balance';
			// Network (e.g LTC or LTCTEST):
			uri += '/' + (argObj.networkName === 'mainnet' ? argObj.currencyCode : argObj.currencyTestCode);
			// Address:
			uri += '/' + encodeURIComponent(argObj.address);
			// Minimum number of confirmations:
			uri += '/0';

			$.get(uri).then(function(result) {

				try {
					var amountReceived = (new BigNumber('0'))
						.plus(result.data.confirmed_balance)
						.plus(result.data.unconfirmed_balance);
				} catch (error) {
					return cb(error);
				}

				cb(null, amountReceived);

			}).fail(cb);

		},

		//  argObj as {address, networkName, currencyCode, currencyTestCode, timestamp}
		getTotalReceivedByAddressSince: function(argObj, cb) {
			var uri = 'https://chain.so/api/v2/get_tx_received';

			uri += '/' + (argObj.networkName === 'mainnet' ? argObj.currencyCode : argObj.currencyTestCode);

			uri += '/' + encodeURIComponent(argObj.address);

			$.get(uri).then(function(result) {
				try {
					var txs = result.data.txs;
					var amountReceived = new BigNumber('0');
					// Selecting newer transactions
					var amountsReceived = txs
					// Selecting newer transactions
					.filter(function(tx) {
						return tx.time >= argObj.timestamp;
					})
					.forEach(function(tx) {
						amountReceived.plus(tx.value);
					});
				} catch (error) {
					return cb(error);
				}

				cb(null, amountReceived);
			}).fail(cb);
		}

	};

})();