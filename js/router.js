var app = app || {};

app.Router = (function() {

	'use strict';

	return Backbone.Router.extend({

		routes: {
			'settings': 'settings',
			'pay': 'pay',
			'pay/:amount': 'choosePaymentMethod',
			'pay/:amount/:method': 'displayPaymentAddress',

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

		settings: function() {

			app.mainView.renderView('Settings');
		},

		pay: function() {

			app.mainView.renderView('Pay');
		},

		choosePaymentMethod: function(amount) {

			app.mainView.renderView('ChoosePaymentMethod', { amount: amount });
		},

		displayPaymentAddress: function(amount, method) {

			app.mainView.renderView('DisplayPaymentAddress', {
				amount: amount,
				method: method
			});
		}

	});

})();
