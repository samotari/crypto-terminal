var app = app || {};

app.views = app.views || {};

app.views.PaymentHistory = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'payment-history',
		template: '#template-payment-history',

		events: {
			'quicktouch .payment-history-item': 'gotoPaymentDetails',
		},

		initialize: function() {

			this.collection = app.paymentRequests;
			this.collection.on('all', this.render);
			this.collection.fetch({
				limit: 10,
				error: function() {
					app.mainView.showMessage(app.i18n.t('payment-history.failed-to-get-payment-data'));
				}
			});
		},

		serializeData: function() {

			var data = {};
			data.payments = this.collection.toJSON();
			data.format = app.settings.get('dateFormat');
			return data;
		},

		gotoPaymentDetails: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			var paymentId = $(evt.currentTarget).attr('data-payment-id');
			app.router.navigate('payment-details/' + paymentId, { trigger: true });
		}
	});
})();
