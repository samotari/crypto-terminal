var app = app || {};

app.views = app.views || {};

app.views.PaymentHistory = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'payment-history',
		template: '#template-payment-history',

		events: {
			'click .payment-history-item': 'gotoPaymentDetails',
			'click #export': 'exportAsCsv'
		},

		initialize: function() {

			this.collection = app.paymentRequests;
			this.collection.on('all', this.render);
			this.collection.fetch({
				error: function() {
					app.main.showMessage(app.i18n.t('payment-history.failed-to-get-payment-data'));
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

			var paymentId = $(evt.currentTarget).attr('data-payment-id');
			app.router.navigate('payment-details/' + paymentId, { trigger: true });
		},

		exportAsCsv: function() {
			var history = _.filter(_.map(this.collection.models, function (model) {
				return model.attributes;
			}), function(model) {
				return model.status !== "pending";
			});

			app.services.export.exportPaymentHistory(history, function () {
				alert(app.i18n.t('payment-history.export-success'));
			}, function (e) {
				console.error(e);
				alert(app.i18n.t('payment-history.export-fail'));
			});

		}

	});
})();
