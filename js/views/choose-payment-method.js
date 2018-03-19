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

			// Navigate back to the amount screen.
			app.router.navigate('pay', { trigger: true });
		},

		continueWithChosenPaymentMethod: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			var amount = this.options.amount.toString();
			var method = $(evt.target).attr('data-payment-method');

			// Navigate to the next screen with the amount in the URI.
			app.router.navigate('pay/' + encodeURIComponent(amount) + '/' + encodeURIComponent(method), { trigger: true });
		},

		onBackButton: function() {

			this.cancel();
		}

	});

})();
