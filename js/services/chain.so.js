var app = app || {};

app.services = app.services || {};

app.services['chain.so'] = (function() {

	'use strict';

	return {

		// argObj as {address, network, amount}
		checkPaymentReceived: function(argObj, cb) {

			app.services['chain.so'].getTotalReceiveByAddress(argObj, function(error, amountReceived) {

				if (error) {
					return cb(error);
				}

				var wasReceived = amountReceived.greaterThanOrEqualTo(argObj.amount);

				cb(null, wasReceived);
			})

		},

		// argObj as {address, networkName}
		getTotalReceiveByAddress: function(argObj, cb) {

			/*
				For API details:
				https://chain.so/api#get-balance
			*/
			var uri = 'https://chain.so/api/v2/get_address_balance';

			// Network (e.g LTC or LTCTEST):
			uri += '/' + (argObj.network === 'mainnet' ? 'LTC' : 'LTCTEST');
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

	};

})();