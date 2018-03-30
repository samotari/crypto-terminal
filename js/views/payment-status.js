var app = app || {};

app.views = app.views || {};

app.views.PaymentStatus = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'payment-status',
		template: '#template-payment-status',

		events: {
			'quicktouch .done': 'done',
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
