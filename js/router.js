var app = app || {};

app.Router = (function() {

	'use strict';

	var allowedWhenNotConfigured = [
		// !! IMPORTANT !!
		// These are router function names, not URI hashes.
		'about',
		'admin',
		'paymentDetails',
	];

	var pinProtected = [
		// Same as above.
		'admin',
		'paymentDetails',
	];

	var paymentScreens = [
		// Same as above.
		'pay',
		'choosePaymentMethod',
		'displayPaymentAddress',
		'paymentStatus',
	];

	var isAllowedWhenNotConfigured = function(routerMethodName) {

		return _.contains(allowedWhenNotConfigured, routerMethodName);
	};

	var isPinProtected = function(routerMethodName) {

		return _.contains(pinProtected, routerMethodName);
	};

	var isPaymentScreen = function(routerMethodName) {

		return _.contains(paymentScreens, routerMethodName);
	};

	return Backbone.Router.extend({

		routes: {
			'pay': 'pay',
			'choose-payment-method': 'choosePaymentMethod',
			'display-payment-address': 'displayPaymentAddress',
			'payment-details/:paymentId': 'paymentDetails',
			'payment-status/:status': 'paymentStatus',
			'admin': 'admin',
			'admin/:page': 'admin',
			'about': 'about',
			'getting-started': 'gettingStarted',
			'getting-started/:page': 'gettingStarted',
			'recommended-mobile-wallets': 'recommendedMobileWallets',

			// For un-matched route, default to:
			'*notFound': 'notFound'
		},

		execute: function(callback, args, name) {

			app.log('router.execute', name);

			if (!isPinProtected(name) && app.requirePin() && app.isUnlocked()) {
				app.lock();
			}

			if (!isPaymentScreen(name)) {
				app.cleanUpPendingPaymentRequest();
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

			if (!app.hasCompletedGettingStarted()) {
				// Must complete the Getting Started steps.
				if (name !== 'gettingStarted') {
					this.navigate('getting-started', { trigger: true });
					// Return false here prevents the current route's handler function from firing.
					return false;
				}
				// Do nothing else here.
				// Continue to getting started screen.
			} else if (!app.isConfigured() && !isAllowedWhenNotConfigured(name)) {
				// Getting Started was completed.
				// But not yet configured.
				// Redirect to admin area.
				this.navigate('admin', { trigger: true });
				// Return false here prevents the current route's handler function from firing.
				return false;
			}

			if (callback) {
				// This is what calls the router function (below).
				callback.apply(this, args);
			}
		},

		notFound: function() {

			// Default screen is starting the payment process.
			this.navigate('pay', { trigger: true });
		},

		admin: function(page) {

			if (page) {
				var subPages = _.chain(app.views.Admin.prototype).result('subPages').pluck('key').value();
				var defaultSubPage = app.views.Admin.prototype.getDefaultSubPage();
				var defaultSubPageKey = defaultSubPage && defaultSubPage.key || null;
				var possiblePages = subPages.concat(app.settings.get('configurableCryptoCurrencies'));
				if (!_.contains(possiblePages, page) && defaultSubPageKey) {
					this.navigate('admin/' + defaultSubPageKey, { trigger: true });
					return false;
				}
			}

			app.mainView.renderView('Admin', { page: page });
		},

		gettingStarted: function(page) {

			if (page) {
				var subPages = _.chain(app.views.GettingStarted.prototype).result('subPages').pluck('key').value();
				var defaultSubPage = app.views.GettingStarted.prototype.getDefaultSubPage();
				var defaultSubPageKey = defaultSubPage && defaultSubPage.key || null;
				var possiblePages = subPages.concat(app.settings.get('configurableCryptoCurrencies'));
				if (!_.contains(possiblePages, page) && defaultSubPageKey) {
					this.navigate('getting-started/' + defaultSubPageKey, { trigger: true });
					return false;
				}
			}

			app.mainView.renderView('GettingStarted', { page: page });
		},

		paymentDetails: function(paymentId) {

			app.mainView.renderView('PaymentDetails', {
				paymentId: paymentId,
			});
		},

		about: function() {

			app.mainView.renderView('About');
		},

		recommendedMobileWallets: function() {

			app.mainView.renderView('RecommendedMobileWallets');
		},

		pay: function() {

			// Create a new payment request, but don't save it.
			var paymentRequest = new app.paymentRequests.model({
				currency: app.settings.get('displayCurrency'),
			});

			app.mainView.renderView('Pay', { model: paymentRequest });
			app.paymentRequests.add(paymentRequest);
		},

		choosePaymentMethod: function() {

			// Get latest payment request.
			var paymentRequest = app.paymentRequests.findWhere({ status: 'pending' });

			if (!paymentRequest) {
				// Start from the beginning of the payment process.
				this.navigate('pay', { trigger: true });
				return false;
			}

			// Reset the method.
			paymentRequest.set({ method: null });

			app.mainView.renderView('ChoosePaymentMethod', { model: paymentRequest });
		},

		displayPaymentAddress: function() {

			// Get latest payment request.
			var paymentRequest = app.paymentRequests.findWhere({ status: 'pending' });

			if (!paymentRequest) {
				// Start from the beginning of the payment process.
				this.navigate('pay', { trigger: true });
				return false;
			}

			app.mainView.renderView('DisplayPaymentAddress', { model: paymentRequest });
		},

		paymentStatus: function(status) {

			app.mainView.renderView('PaymentStatus', {
				status: status,
			});
		},

	});

})();
