var app = app || {};

app.paymentMethods = app.paymentMethods || {};

app.paymentMethods.monero = (function() {

	'use strict';

	return app.abstracts.PaymentMethod.extend({

		label: 'Monero',
		code: 'XMR',

		settings: [
			{
				name: 'address',
				label: 'Public Address',
				type: 'text',
				required: true,
				validate: function(value) {
					if (!app.paymentMethods.monero.validateAddress(value)) {
						throw new Error('Invalid public address');
					}
				}
			}//,

			// {
			// 	name: 'viewPrivateKey',
			// 	label: 'View Private Key',
			// 	type: 'text',
			// 	required: true,
			// 	validate: function(value) {
			// 		if (!app.paymentMethods.monero.validateViewPK(value)) {
			// 			throw new Error('Invalid view private key');
			// 		}
			// 	}
			// }
		],

		// Robin: payment request should only carry the address; the payment id and the amount must be displayed on the screen for the person to use when they pay.
		generatePaymentRequest: function(amount, cb) {

			//Robin: I'd rather generatePaymentRequest returned the object paymentRequest with the properties amount and payment id
			
			var address = app.settings.get('monero.address');

			this.getPaymentId(function(error, paymentId) {

				if (error) {
					return cb(error);
				}

				var paymentRequest = address;
				//paymentRequest += '?amount=' + amount;
				//paymentRequest += '&payment_id=' + paymentId;
				cb(null, paymentRequest, address, paymentId);
			});
		},

		generatePaymentId: function(cb) {

			var randomString = app.util.generateRandomString(32);
			var paymentId = '';
			for (var index = 0; index < randomString.length; index++ ) {
				paymentId += randomString.charCodeAt(index).toString(16);
			}

			_.defer(cb, null, paymentId);
		},

		getPaymentId: function(cb) {
			this.generatePaymentId(function(error, paymentId) {
				if (error) {
					return cb(error);
				}

				cb(null, paymentId);
			});
		},

		getExchangeRates: function(cb) {

			// Get exchange rate info from Coinbase's API.
			// Monero is NOT on Coinbase, so get rate from poloniex
			$.get('https://api.coinbase.com/v2/exchange-rates?currency=BTC').then(function(result) {

				$.get('https://poloniex.com/public?command=returnTicker').then(function(poloniex) {
					
					var XMR_to_BTC_rate = +poloniex.BTC_XMR.last;

					var rates = {};

					_.each(result.data.rates, function(rate, code) {
						code = code.toUpperCase();
						if (_.contains(app.config.supportedDisplayCurrencies, code)) {
							rates[code] = (+rate * XMR_to_BTC_rate).toString();
						}
					});

					cb(null, rates);

				}).fail(cb);
			}).fail(cb);
		},

		validateAddress: function(addr) {
			// addr should be a base58 encoded string of 95 characters
			if (addr.length !== 95) {
				// throw new Error('Address: Invalid length');
				return false;
			}

			
			// convert it 11 characters at a time to hexadecimal value to get hexAddr

			var hexAddr = '';
			for (var i=0; i<88; i=i+11) {
				var bytes = monero.bs58.decode(addr.slice(i,i+11));
				hexAddr += bytes.toString('hex');
			}

			var bytes = monero.bs58.decode(addr.slice(88,95));
			hexAddr += bytes.toString('hex');

			// check first byte is 12 (so-called network byte)

			if (hexAddr.slice(0,2) !== '12') {
				// throw new Error('Address: Invalid Network Byte');
				return false;
			}

			// compute keccak-256 of first 65 bytes and verify it matches last 4 bytes of hexAddr

			var hash = monero.keccak256(app.util.hextobin(hexAddr.slice(0, 130)));

			if (hash.slice(0,8) !== hexAddr.slice(-8)) {
				// throw new Error('Address: Invalid Address');
				return false;
				
			}

			return true;
		},

		getAddress: function(cb) {
			_.defer(cb, null, app.settings.get('monero.address'));
		},

		// validateViewPK: function(viewpk) {
			
		// 	// should be a string of length 64
		// 	if (viewpk.length !== 64)
		// 		return false;

		// 	// deriving viewpk should match the view public key in the address
		// 	var addr = this.settings.get('address');

		// 	var hexAddr = '';
		// 	for (var i=0; i<88; i=i+11) {
		// 		var bytes = monero.bs58.decode(addr.slice(i,i+11));
		// 		hexAddr += bytes.toString('hex');
		// 	}

		// 	var bytes = monero.bs58.decode(addr.slice(88,95));
		// 	hexAddr += bytes.toString('hex');

		// 	// the public view key is located in position 2+32
		// 	var viewPublicKeyFromAddr = hexAddr.slice(34,66);


		// 	if ()
		// },

	});
})();
