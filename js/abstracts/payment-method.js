var app = app || {};

app.abstracts = app.abstracts || {};

app.abstracts.PaymentMethod = (function() {

	'use strict';

	return {

		// The `label` attribute is the name of the cryptocurrency that will be shown in the UI.
		label: null,

		// The `code` attribute is the short-name of the currency, typically used for reference purposes.
		code: null,

		// The `settings` array will allow the end-user (merchant) to configure this cryptocurrency.
		settings: [
			// {
			// 	name: 'some-field',
			// 	label: 'Some Field (for Humans)',
			// 	type: 'text',
			// 	required: true,
			// 	validate: function(value) {
			// 		// For checking the form value for this field.
			// 		// Throw an error if the value is invalid. Like this:
			// 		throw new Error('Some field is invalid!');
			// 	}
			// }
		],

		/*
			`amount` .. A valid number
			`cb(error, paymentRequest)`:
				`error`          .. An error object if some problem occurs while generating the payment request
				`paymentRequest` .. An object containing at least the following information:
					`uri`        .. URI (e.g "bitcoin:ADDRESS?amount=AMOUNT")
					`amount`     .. The amount requested.
					`address`    .. The address to which to send the funds.
		*/
		generatePaymentRequest: function(amount, cb) {
			_.defer(function() {
				cb(new Error('This payment method has not implemented the generatePaymentRequest(amount, cb) method.'));
			});
		},

		/*
			`cb(error, rates)`:
				`error`	.. An error object if some problem occurs while generating the payment request
				`rates`	.. An object containing conversion rates for all supported currencies. E.g:
							{ 'USD': '0.0012', 'EUR': '0.00091' }
		*/
		getExchangeRates: function(cb) {
			_.defer(function() {
				cb(new Error('This payment method has not implemented the `getExchangeRates` method.'));
			});
		},

		/*
			`paymentRequest` .. A cryptocurrency payment request (e.g "bitcoin:ADDRESS?amount=AMOUNT")
			`cb(error, wasReceived)`:
				`error` .. An error object or NULL
				`wasReceived` .. TRUE or FALSE
		*/
		checkPaymentReceived: function(paymentRequest, cb) {
			_.defer(function() {
				cb(new Error('This payment method has not implemented the `checkPaymentReceived` method.'));
			});
		},

		convertAmount: function(amount, fromCurrency, cb) {

			_.defer(_.bind(function() {

				try {
					amount = new BigNumber(amount);
				} catch (error) {
					return cb(new Error('Invalid "amount". Number expected.'));
				}

				if (!_.isString(fromCurrency)) {
					return cb(new Error('Invalid "fromCurrency". String expected.'));
				}

				fromCurrency = fromCurrency.toUpperCase();

				this.getExchangeRates(function(error, rates) {

					if (error) {
						return cb(error);
					}

					if (_.isUndefined(rates[fromCurrency])) {
						return cb(new Error('Conversion rate not found for given currency: "' + fromCurrency + '"'));
					}

					var rate = rates[fromCurrency];
					amount = amount.dividedBy(rate);
					// Maximum of 8 decimal places.
					amount = amount.decimalPlaces(8);
					cb(null, amount.toString(), rate, fromCurrency);
				});

			}, this));
		},

		extend: function() {
			var args = Array.prototype.slice.call(arguments);
			return app.util.extend.apply(undefined, [this].concat(args));
		}
	};

})();
