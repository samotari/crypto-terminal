var app = app || {};

app.Router = (function() {

	'use strict';

	return Backbone.Router.extend({

		routes: {
			'pay': 'pay',
			'confirmed': 'paymentConfirmation',
			'pay/:amount': 'choosePaymentMethod',
			'pay/:amount/:method': 'displayPaymentAddress',
			'payment-history': 'paymentHistory',
			'payment-details/:paymentId': 'paymentDetails',
			'settings': 'settings',
			'settings/:page': 'settings',

			// For un-matched route, default to:
			'*notFound': 'notFound'
		},

		execute: function(callback, args, name) {

			if (name !== 'settings' && !app.settings.isConfigured()) {
				this.navigate('settings', { trigger: true });
				return false;
			}

			if (callback) {
				callback.apply(this, args);
			}
		},

		notFound: function() {

			// Default screen is starting the payment process.
			this.navigate('pay', { trigger: true });
		},

		settings: function(page) {

			if (page) {
				// Don't allow navigation to disabled cryptocurrency settings pages.
				if (page !== 'general' && !_.contains(app.settings.get('configurableCryptoCurrencies'), page)) {
					return this.navigate('settings/general', { trigger: true });
				}
			}

			app.mainView.renderView('Settings', { page: page });
		},

		pay: function() {

			app.mainView.renderView('Pay');
		},

		paymentConfirmation: function(){

			app.mainView.renderView('PaymentConfirmation');

		},

		choosePaymentMethod: function(amount) {

			app.mainView.renderView('ChoosePaymentMethod', { amount: amount });
		},

		displayPaymentAddress: function(amount, method) {

			app.mainView.renderView('DisplayPaymentAddress', {
				amount: amount,
				method: method
			});
		},

		paymentHistory: function() {

			app.mainView.renderView('PaymentHistory')
		},

		paymentDetails: function(paymentId) {

			app.mainView.renderView('PaymentDetails', {
				paymentId: paymentId
			});
		}

	});

})();
