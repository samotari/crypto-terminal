// PaymentDetail

var app = app || {};

app.views = app.views || {};

app.views.PaymentDetails = (function() {

	'use strict';

	return Backbone.View.extend({

		className: 'payment-detail',
		template: '#template-payment-details',

		events: {
		},

        initialize: function(options) {

			this.options = options || {};
		},

		render: function() {
			
			if (!app.paymentRequests.get(this.options.paymentId)) {
				app.paymentRequests.fetch();
			}
			var paymentInfo = app.paymentRequests.get(this.options.paymentId).attributes;

			var html = $(this.template).html();
			var template = Handlebars.compile(html);
			this.$el.html(template(paymentInfo));
			return this;
		},
	});
})();
