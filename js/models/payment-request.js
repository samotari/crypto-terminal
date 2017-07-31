var app = app || {};

app.models = app.models || {};

app.models.PaymentRequest = (function() {

	'use strict';

	return Backbone.Model.extend({
        idAttribute: 'id',

        defaults: function() {
            return {
                currency: '',
                address: '',
                confirmed: '',
                amount: '',
                timestamp: (new Date).getTime()
            };
        }
	});
})();
