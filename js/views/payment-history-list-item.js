var app = app || {};

app.views = app.views || {};

app.views.PaymentHistoryListItem = (function() {

	'use strict';

	return app.views.utility.ListItem.extend({

		className: 'payment-history-item',
		template: '#template-payment-history-list-item',

		onRender: function() {

			this.$el.addClass('status-' + this.model.get('status'));
			this.$el.attr('data-payment-id', this.model.get('id'));
		},

		serializeData: function() {

			var data = _.pick(this.model.toJSON(), 'id', 'status', 'amount', 'currency', 'timestamp');
			var method = this.model.get('method');
			var paymentMethod = app.paymentMethods[method];
			try {
				data.cryptoAmount = this.model.getCryptoAmount();
			} catch (error) {
				app.log(error);
			}
			data.paymentMethod = _.pick(paymentMethod, 'code');
			return data;
		},

	});
})();
