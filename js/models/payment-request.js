var app = app || {};

app.models = app.models || {};

app.models.PaymentRequest = (function() {

	'use strict';

	var statuses = [
		'pending',// Waiting to receive transaction(s).
		'unconfirmed',// Received transaction(s), but waiting for confirmations.
		'confirmed',// Received transaction(s) which have been confirmed in at least one block.
		'timed-out',// Timed-out while waiting to receive transactions.
		'canceled',// Canceled by the customer.
	];

	return Backbone.Model.extend({

		initialize: function() {

			this.collection = app.paymentRequests;
		},

		defaults: function() {
			return {
				// The display currency used for the payment request.
				currency: null,
				// The amount requested (in the display currency).
				amount: null,
				// The conversion rate (to the payment method currency) when the payment request was created.
				rate: null,
				// The payment method used (bitcoin, litecoin, monero, ..)
				method: null,
				// The payment request URI (e.g "bitcoin:<ADDRESS>?amount=0.005")
				uri: null,
				// The status of the payment.
				status: 'pending',
				// The timestamp (in milliseconds) at the time the payment request was created.
				timestamp: (new Date).getTime(),
				// Arbitrary data field.
				// So that each payment method can store custom data with a payment request.
				data: {},
			};
		},

		validate: function(attributes, options) {

			if (attributes.data && !_.isObject(attributes.data)) {
				return app.i18n.t('payment-request.data.must-be-object');
			}

			if (attributes.status && !_.contains(statuses, attributes.status)) {
				return app.i18n.t('payment-request.status.invalid');
			}
		},

		isPending: function() {

			var status = this.get('status');
			return !status || status === 'pending';
		},

		isSaved: function() {

			return !!this.get('id');
		},

		isComplete: function() {

			var requiredFields = ['amount', 'currency', 'method', 'rate'];
			var isPending = this.get('status') === 'pending';
			return this.isSaved() && !isPending && _.every(requiredFields, function(field) {
				return !!this.get(field);
			}, this);
		},

		getCryptoAmount: function() {

			var amount = this.get('amount');
			var rate = this.get('rate');

			if (_.isNull(amount)) {
				throw new Error(app.i18n.t('payment-request.crypto-amount.amount-required'));
			}

			if (_.isNull(rate)) {
				throw new Error(app.i18n.t('payment-request.crypto-amount.rate-required'));
			}

			return (new BigNumber(amount)).dividedBy(rate).toString();
		},

	});
})();
