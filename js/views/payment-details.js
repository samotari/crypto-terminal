var app = app || {};

app.views = app.views || {};

app.views.PaymentDetails = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'payment-detail',
		template: '#template-payment-details',

		initialize: function() {

			this.model = app.paymentRequests.get(this.options.paymentId);
			this.model.on('sync change', this.render);
		},

		serializeData: function() {

			var data = this.model.toJSON();
			data.format = app.settings.get('dateFormat')
			return data;
		}
	});
})();
