var app = app || {};

app.abstracts = app.abstracts || {};

app.abstracts.PaymentMethod = (function() {

	'use strict';

	return {

		// The `label` attribute is the name of the cryptocurrency that will be shown in the UI.
		label: null,

		// The `code` attribute is the short-name of the currency, typically used for reference purposes.
		code: null,

		config: {
			listenForPayment: {
				pollingDelay: 5000,
			},
		},

		// The `settings` array will allow the end-user (merchant) to configure this cryptocurrency.
		settings: [
			// {
			// 	name: 'some-field',
			// 	label: 'Some Field (for Humans)',
			// 	type: 'text',
			// 	required: true,
			// 	validate: function(value, data) {
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
			`paymentRequest` .. A cryptocurrency payment request object
			`cb(error, wasReceived, paymentData)`:
				`error` .. An error object or NULL
				`wasReceived` .. TRUE or FALSE
				'paymentData'  An object containing payment information
		*/
		checkPaymentReceived: function(paymentRequest, cb) {
			_.defer(function() {
				cb(new Error('This payment method has not implemented the `checkPaymentReceived` method.'));
			});
		},

		getExchangeRate: function(toCurrency, done) {

			if (!_.isString(toCurrency)) {
				return done(new Error('Invalid "toCurrency". String expected.'));
			}
			toCurrency = toCurrency.toUpperCase();
			app.services.exchangeRates.get({
				currencies: {
					from: this.code,
					to: toCurrency,
				},
				provider: app.settings.get('exchangeRatesProvider'),
			}, done);
		},

		listenForPayment: function(paymentRequest, cb) {

			this.stopListeningForPayment();

			var received = false;
			var delay = this.config.listenForPayment.pollingDelay;
			var data;
			var iteratee = _.bind(function(next) {
				this.checkPaymentReceived(paymentRequest, _.bind(function(error, wasReceived, paymentData) {

					if (error) {
						return next(error);
					}

					if (wasReceived) {
						received = true;
						data = paymentData;
						return next();
					}

					// Wait before checking again.
					this._listenForPaymentTimeout = _.delay(next, delay);

				}, this));
			}, this);

			async.until(function() { return received }, iteratee, function(error) {

				if (error) {
					return cb(error);
				}
				// Passing payment data so it can be stored.
				cb(null, data);
			});
		},

		stopListeningForPayment: function() {

			clearTimeout(this._listenForPaymentTimeout);
		},

		isConfigured: function() {

			return _.every(this.inputs || [], function(input) {
				return input.required !== true || !!app.settings.get(input.name);
			});
		},

		isActive: function() {

			// Override this method with your own custom logic.
			return false;
		},

		createVerificationView: null,

		hasVerificationView: function() {

			return !!this.createVerificationView && _.isFunction(this.createVerificationView);
		},

		extend: function() {

			var args = Array.prototype.slice.call(arguments);
			return app.util.extend.apply(undefined, [this].concat(args));
		},
	};

})();
