var app = app || {};

app.views = app.views || {};

app.views.PaymentHistory = (function() {

	'use strict';

	return app.views.utility.List.extend({

		className: 'payment-history',
		template: '#template-payment-history',
		itemContainer: '.payment-history-items',
		events: {
			'click .payment-history-item': 'showPaymentDetails',
		},

		collection: function() {
			return app.paymentRequests;
		},

		ItemView: function() {
			return app.views.PaymentHistoryListItem;
		},

		onRender: function() {

			app.views.utility.List.prototype.onRender.apply(this, arguments);
			var collection = _.result(this, 'collection');
			var total = _.result(collection, 'total');
			this.$el.toggleClass('empty', total === 0);
		},

		showPaymentDetails: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			var paymentId = $(evt.currentTarget).attr('data-payment-id');
			app.router.navigate('payment-details/' + paymentId, { trigger: true });
		},

		addItem: function(model) {

			if (model.isComplete()) {
				// Only add "complete" payment requests.
				app.views.utility.List.prototype.addItem.apply(this, arguments);
			}
		},

		exportPaymentDetails: function() {

			var fileName = app.config.paymentHistory.export.fileName;

			var history = _.filter(_.map(this.collection.models, function (model) {
				return model.attributes;
			}));

			app.services.exportPayments.exportPaymentDetails(history, fileName, function(error) {

				if (error) {
					return alert(app.i18n.t('payment-history.export.fail'));
				}

				alert(app.i18n.t('payment-history.export.success'));

			})
			
		}
	});
})();
