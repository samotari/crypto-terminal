var app = app || {};

app.views = app.views || {};

app.views.PaymentReplaceable = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'payment-replaceable',
		template: '#template-payment-replaceable',

		events: {
			'click .accept': 'accept',
			'click .reject': 'reject',
		},

		serializeData: function() {

			return {
				text: {
					message: app.i18n.t('payment-replaceable.message'),
					info: app.i18n.t('payment-replaceable.info'),
					accept: app.i18n.t('payment-replaceable.accept'),
					reject: app.i18n.t('payment-replaceable.reject'),
				},
			};
		},

		onRender: function() {

			this.playSound();
		},

		playSound: function() {

			app.sound.play('pay-fail-01');
		},

		accept: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			// Navigate to the payment status screen (to show success and save the model).
			// It is important to keep the status "pending" till the success screen so router finds it.
			app.router.navigate('payment-status/unconfirmed', { trigger: true });
		},

		reject: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			app.router.navigate('display-payment-address', { trigger: true });
		},

		onBackButton: function() {

			this.reject();
		},

	});

})();