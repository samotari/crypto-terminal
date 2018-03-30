var app = app || {};

app.views = app.views || {};

app.views.PaymentHistory = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'payment-history',
		template: '#template-payment-history',

		events: {
			'quicktouch .payment-history-item': 'showPaymentDetails',
		},

		initialize: function() {

			this.collection = app.paymentRequests;
			this.listenTo(this.collection, 'all', this.render);
			this.collection.fetch({
				limit: 10,
				error: function() {
					app.mainView.showMessage(app.i18n.t('payment-history.failed-to-get-payment-data'));
				}
			});
		},

		serializeData: function() {

			var data = {};
			data.payments = _.chain(this.collection.models).filter(function(payment) {
				return payment.isComplete();
			}).map(function(payment) {
				var method = payment.get('method');
				var paymentMethod = app.paymentMethods[method];
				var cryptoAmount = payment.getCryptoAmount();
				return _.extend({}, _.pick(payment.toJSON(), 'id', 'status', 'amount', 'currency', 'timestamp'), {
					cryptoAmount: cryptoAmount,
					paymentMethod: _.pick(paymentMethod, 'code'),
				});
			}).value();
			return data;
		},

		showPaymentDetails: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			var paymentId = $(evt.currentTarget).attr('data-payment-id');
			app.router.navigate('payment-details/' + paymentId, { trigger: true });
		}
	});
})();
