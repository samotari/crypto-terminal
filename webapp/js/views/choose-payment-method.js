var app = app || {};

app.views = app.views || {};

app.views.ChoosePaymentMethod = (function() {

	'use strict';

	return Backbone.View.extend({

		className: 'choose-payment-method',

		template: '#template-pay-choose-method',

		events: {
			'click .payment-method': 'continueWithChosenPaymentMethod',
			'click .cancel': 'cancel'
		},

		initialize: function(options) {

			this.options = options || {};
		},

		render: function() {

			var html = $(this.template).html();
			var template = Handlebars.compile(html);
			var data = {};
			data.paymentMethods = _.map(app.settings.get('acceptCryptoCurrencies'), function(key) {
				return { key: key };
			});
			this.$el.html(template(data));
			this.$error = this.$('.error');
			return this;
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
