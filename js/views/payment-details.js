var app = app || {};

app.views = app.views || {};

app.views.PaymentDetails = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'payment-detail',
		template: '#template-payment-details',

		events: {
			'click .back': 'back',
		},

		initialize: function() {

			this.model = new app.paymentRequests.model({ id: this.options.paymentId });
			this.model.on('sync change', this.render);
			this.model.fetch();
		},

		serializeData: function() {

			var data = _.pick(this.model.toJSON(), ['status', 'amount', 'currency', 'timestamp']);
			var method = this.model.get('method');
			var paymentMethod = app.paymentMethods[method];
			try {
				data.cryptoAmount = this.model.getCryptoAmount();
			} catch (error) {
				app.log(error);
			}
			data.paymentMethod = _.pick(paymentMethod, 'code');
			return data
		},

		onRender: function() {

			this.$el.addClass('status-' + this.model.get('status'));
		},

		back: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			app.router.navigate('admin/payment-history', { trigger: true });
		},

		onBackButton: function() {

			app.router.navigate('admin/payment-history', { trigger: true });
		}
	});
})();
