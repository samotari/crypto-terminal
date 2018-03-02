var app = app || {};

app.models = app.models || {};

app.models.PaymentRequest = (function() {

	'use strict';

	var statuses = [
		'pending',// Waiting to receive transaction(s).
		'unconfirmed',// Received transaction(s), but waiting for confirmations.
		'confirmed',// Received transaction(s) which have been confirmed in at least one block.
		'timed-out',// Timed-out while waiting to receive transactions.
	];

	return Backbone.Model.extend({

		defaults: function() {
			return {
				currency: '',
				address: '',
				amount: '',
				displayCurrency: {
					code: '',
					rate: ''
				},
				status: 'pending',
				timestamp: (new Date).getTime(),
				// Arbitrary data field.
				// So that each payment method can store custom data with a payment request.
				data: {},
			};
		},

		validate: function(attributes, options) {

			if (!_.isObject(attributes.data)) {
				return app.i18n.t('payment-request.data.must-be-object');
			}

			if (attributes.status && !_.contains(statuses, attributes.status)) {
				return app.i18n.t('payment-request.status.invalid');
			}
		}
	});
})();
