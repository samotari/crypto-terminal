var app = app || {};

app.views = app.views || {};

app.views.PaymentStatus = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'payment-status',
		template: '#template-payment-status',

		events: {
			'click .done': 'done',
		},

		initialize: function() {
			var paymentRequest = this.model.toJSON();
			var status = this.options.status;

			this.model.save(
				_.extend(
					{},
					paymentRequest,
					{
						status: status,
					}
				)
			);
		},

		serializeData: function() {

			var status = this.options.status;
			return {
				text: {
					message: app.i18n.t('payment-status.' + status + '.message'),
					done: app.i18n.t('payment-status.' + status + '.done'),
				},
			};
		},

		onRender: function() {

			this.$el.addClass(this.options.status);
			this.playSound();
		},

		playSound: function() {

			var status = this.options.status;
			switch (status) {
				case 'unconfirmed':
					app.sound.play('pay-success-01');
					break;
			}
		},

		done: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			// Navigate back to the homescreen
			app.router.navigate('pay', { trigger: true });
		},

		onBackButton: function() {

			this.done();
		},

	});

})();
