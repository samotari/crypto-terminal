var app = app || {};

app.views = app.views || {};

app.views.PaymentHistory = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'payment-history',
		template: '#template-payment-history',

		events: {
			'click .payment-history-item': 'gotoPaymentDetails'
		},

		serializeData: function() {

			var data = {};

			app.paymentRequests.fetch({
				success: function(response) {
					data.payments = _.map(response.models, function(model) {
						return model.attributes;
					})
				},
				error: function() {
					throw new Error('Fail to get Payments!');
				}
			});

			return data;
		},

		gotoPaymentDetails: function(evt) {

			var paymentId = $(evt.currentTarget).attr('data-payment-id');
			app.router.navigate('payment-details/' + paymentId, { trigger: true });
		}
	});
})();
