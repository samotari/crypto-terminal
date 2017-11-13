var app = app || {};

app.models = app.models || {};

app.models.PaymentRequest = (function() {

	'use strict';

	return Backbone.Model.extend({

        defaults: function() {
            return {
                currency: '',
                address: '',
                confirmed: '',
                amount: '',
                timestamp: (new Date).getTime(),
                // Arbitrary data field.
                // So that each payment method can store custom data with a payment request.
                data: {}
            };
        },

        validate: function(attributes, options) {

            if (!_.isObject(attributes.data)) {
                return '"data" must be an object.';
            }
        }
    });
})();
