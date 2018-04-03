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
			app.services.ctApi.getExchangeRates(this.code, cb);
		},

		listenForPayment: function(paymentRequest, cb) {

			var received = false;
			var waitBetween = 5000;
			var iteratee = _.bind(function(next) {
				this.checkPaymentReceived(paymentRequest, _.bind(function(error, wasReceived) {

					if (error) {
						return next(error);
					}

					if (wasReceived) {
						received = true;
						return next();
					}

					// Wait before checking again.
					this._listenForPaymentTimeout = _.delay(next, waitBetween);

				}, this));
			}, this);

			async.until(function() { return received }, iteratee, function(error) {

				if (error) {
					return cb(error);
				}

				cb(null, received);
			});
		},

		stopListeningForPayment: function() {

			clearTimeout(this._listenForPaymentTimeout);
		},

		/*
			`paymentRequest` .. A cryptocurrency payment request object
			`cb(error, wasReceived)`:
				`error` .. An error object or NULL
				`wasReceived` .. TRUE or FALSE
		*/
		checkPaymentReceived: function(paymentRequest, cb) {
			_.defer(function() {
				cb(new Error('This payment method has not implemented the `checkPaymentReceived` method.'));
			});
		},

		getExchangeRate: function(fromCurrency, cb) {

			if (!_.isString(fromCurrency)) {
				return cb(new Error('Invalid "fromCurrency". String expected.'));
			}

			fromCurrency = fromCurrency.toUpperCase();

			var toCurrency = this.code;
			var paymentMethod = _.findWhere(app.paymentMethods, { code: fromCurrency });
			var getExchangeRates;

			if (paymentMethod) {
				getExchangeRates = _.bind(paymentMethod.getExchangeRates, paymentMethod);
			} else {
				getExchangeRates = _.bind(this.getExchangeRates, this);
			}

			getExchangeRates(function(error, rates) {

				if (error) {
					return cb(error);
				}

				var rate;

				if (paymentMethod) {
					rate = (new BigNumber(1)).dividedBy(rates[toCurrency]);
				} else {
					rate = rates[fromCurrency];
				}

				cb(null, rate);
			});
		},

		extend: function() {
			var args = Array.prototype.slice.call(arguments);
			return app.util.extend.apply(undefined, [this].concat(args));
		}
	};

})();
