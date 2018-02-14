var app = app || {};

app.views = app.views || {};

app.views.ChoosePaymentMethod = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'choose-payment-method',

		template: '#template-pay-choose-method',

		events: {
			'quicktouch .payment-method': 'continueWithChosenPaymentMethod',
			'quicktouch .cancel': 'cancel',
		},

		serializeData: function() {

			var data = {};
			var acceptedCryptoCurrencies = app.settings.getAcceptedCryptoCurrencies();
			data.paymentMethods = _.map(acceptedCryptoCurrencies, function(key) {
				return { key: key };
			});
			return data;
		},

		cancel: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			app.cleanUpPendingPaymentRequest();

			// Navigate back to the amount screen.
			app.router.navigate('pay', { trigger: true });
		},

		continueWithChosenPaymentMethod: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			var method = $(evt.target).attr('data-payment-method');
			this.model.set({ method: method });

			// Navigate to the next screen with the amount in the URI.
			app.router.navigate('display-payment-address', { trigger: true });
		},

		onBackButton: function() {

			this.cancel();
		},

	});

})();
