// PaymentHistory

var app = app || {};

app.views = app.views || {};

app.views.PaymentHistory = (function() {

	'use strict';

	return Backbone.View.extend({

		className: 'payment-history',
		template: '#template-payment-history',

		events: {
			'click .payment-history-item': 'gotoPaymentDetails'
		},

		render: function() {
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
			})

			var html = $(this.template).html();
			var template = Handlebars.compile(html);
			this.$el.html(template(data));
			return this;
		},

		gotoPaymentDetails: function(ev) {

			var paymentId = $(ev.currentTarget).attr('data-payment-id');
			app.router.navigate('payment-details/' + paymentId, { trigger: true });
		}
	});
})();
