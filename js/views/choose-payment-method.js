var app = app || {};

app.views = app.views || {};

app.views.ChoosePaymentMethod = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'choose-payment-method',

		template: '#template-pay-choose-method',

		events: {
			'click .payment-method': 'continueWithChosenPaymentMethod',
			'click .cancel': 'cancel'
		},

		serializeData: function() {

			var data = {};
			var acceptedCryptoCurrencies = app.settings.getAcceptedCryptoCurrencies();
			data.paymentMethods = _.map(acceptedCryptoCurrencies, function(key) {
				return { key: key };
			});
			return data;
		},

		onRender: function() {

			this.$error = this.$('.error');
		},

		cancel: function() {

			// Navigate back to the amount screen.
			app.router.navigate('pay', { trigger: true });
		},

		continueWithChosenPaymentMethod: function(evt) {

			evt.preventDefault();

			this.clearError();

			var amount = this.options.amount.toString();
			var method = $(evt.target).attr('data-payment-method');

			// Navigate to the next screen with the amount in the URI.
			app.router.navigate('pay/' + encodeURIComponent(amount) + '/' + encodeURIComponent(method), { trigger: true });
		},

		clearError: function() {

			this.$error.text('');
		},

		showError: function(error) {

			this.$error.text(error);
		}

	});

})();
