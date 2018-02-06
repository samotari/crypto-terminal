var app = app || {};

app.views = app.views || {};

app.views.PaymentDetails = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'payment-detail',
		template: '#template-payment-details',

		serializeData: function() {

			if (!app.paymentRequests.get(this.options.paymentId)) {
				app.paymentRequests.fetch();
			}
			var data = {};
			data = _.clone(app.paymentRequests.get(this.options.paymentId).attributes);
			data.format = app.settings.get('dateFormat')
			return data;
		}
	});
})();
