var app = app || {};

app.Router = (function() {

	'use strict';

	var allowedWhenNotConfigured = [
		// !! IMPORTANT !!
		// These are router function names, not URI hashes.
		'about',
		'admin',
	];

	var pinProtected = [
		// Same as above.
		'admin',
		'paymentDetails',
	];

	var isAllowedWhenNotConfigured = function(routerMethodName) {

		return _.contains(allowedWhenNotConfigured, routerMethodName);
	};

	var isPinProtected = function(routerMethodName) {

		return _.contains(pinProtected, routerMethodName);
	};

	return Backbone.Router.extend({

		routes: {
			'pay': 'pay',
			'confirmed': 'paymentConfirmation',
			'pay/:amount': 'choosePaymentMethod',
			'pay/:amount/:method': 'displayPaymentAddress',
			'payment-details/:paymentId': 'paymentDetails',
			'admin': 'admin',
			'admin/:page': 'admin',
			'about': 'about',

			// For un-matched route, default to:
			'*notFound': 'notFound'
		},

		execute: function(callback, args, name) {

			if (!isPinProtected(name) && app.requirePin() && app.isUnlocked()) {
				app.lock();
			}

			if (isPinProtected(name)) {
				if (app.requirePin() && !app.isUnlocked()) {

					// PIN required.

					var enterPinView = new app.views.EnterPin({
						title: app.i18n.t('pin-required.title'),
						instructions: app.i18n.t('pin-required.instructions'),
						showCancel: app.isConfigured(),
						closable: false,
					});

					enterPinView.on('pin', function() {

						// Get keys entered from number pad view.
						var keys = enterPinView.numberPadView.getKeys();

						if (!app.checkPin(keys)) {
							enterPinView.numberPadView.resetKeys();
							return app.mainView.showMessage(app.i18n.t('pin-required.incorrect'));
						}

						// Correct PIN entered.

						// Close the enter PIN view.
						enterPinView.close();

						// Unlock the settings screen.
						app.unlock();

						if (callback) {
							callback.apply(this, args);
						}
					});

					enterPinView.on('cancel', function() {
						if (app.isConfigured()) {
							app.router.navigate('pay', { trigger: true });
						}
					});

					// Stop the route from executing.
					return false;
				}
			}

			if (!app.isConfigured() && !isAllowedWhenNotConfigured(name)) {
				this.navigate('admin', { trigger: true });
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

		admin: function(page) {

			if (page) {
				// Don't allow navigation to disabled cryptocurrency settings pages.
				for (var key in app.paymentMethods) {
					if (page === key) {
						if (!_.contains(app.settings.get('configurableCryptoCurrencies'), key)) {
							return this.navigate('admin/general-settings', { trigger: true });
						}
						break;
					}
				}
			}

			app.mainView.renderView('Admin', { page: page });
		},

		about: function() {

			app.mainView.renderView('About');
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

		paymentDetails: function(paymentId) {

			app.mainView.renderView('PaymentDetails', {
				paymentId: paymentId
			});
		}

	});

})();
