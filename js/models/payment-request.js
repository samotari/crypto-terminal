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
                displayCurrency: {
                    code: '',
                    rate: ''
                },
                timestamp: (new Date).getTime(),
                // Arbitrary data field.
                // So that each payment method can store custom data with a payment request.
                data: {}
            };
        },

        validate: function(attributes, options) {

            if (!_.isObject(attributes.data)) {
                return app.i18n.t('payment-request.data.must-be-object');
            }
        }
    });
})();
