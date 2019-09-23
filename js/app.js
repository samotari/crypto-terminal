var app = app || {};

(function() {

	'use strict';

	app = _.extend({}, app, Backbone.Events);

	app.exit = function() {
		app.cleanUpPendingPaymentRequest();
		navigator.app.exitApp();
	};

	app.busy = function(isBusy) {
		$('html').toggleClass('busy', isBusy !== false);
		if (isBusy) {
			app.trigger('busy');
		} else {
			app.trigger('notBusy');
		}
	};

	app.isBusy = function() {
		return $('html').hasClass('busy');
	};

	app.isCordova = function() {
		return typeof cordova !== 'undefined';
	};

	app.isAndroid = function() {
		return this.isCordova() && cordova.platformId === 'android';
	};

	app.cleanUpPendingPaymentRequest = function() {
		app.log('cleanUpPendingPaymentRequest');
		var paymentRequest = app.paymentRequests.findWhere({ status: 'pending' });
		if (paymentRequest && !paymentRequest.isComplete()) {
			if (paymentRequest.isSaved()) {
				paymentRequest.save({ status: 'canceled' });
			} else {
				app.paymentRequests.remove(paymentRequest);
			}
		}
	};

	app.initializeElectrumServices = function(options) {
		options = _.defaults(options || {}, {
			force: false,
		});
		app.services.electrum = app.services.electrum || {};
		var networks = _.chain(app.settings.getAcceptedPaymentMethods()).filter(function(paymentMethod) {
			return !!paymentMethod.electrum;
		}).map(function(paymentMethod) {
			return [paymentMethod.ref, paymentMethod.electrum];
		}).object().value();
		_.each(networks, function(electrumConfig, network) {
			if (!app.services.electrum[network] || options.force) {
				options = _.extend({}, options, {
					servers: electrumConfig.servers,
					defaultPorts: electrumConfig.defaultPorts,
					debug: app.debugging(),
				});
				var service = app.services.electrum[network] = new app.abstracts.ElectrumService(network, options);
				service.initialize(function(error) {
					if (error) {
						app.log('Failed to initialize ElectrumService', network, error);
					} else {
						app.log('ElectrumService initialized!', network);
					}
				});
			}
		});
	};

	app.isDeveloperMode = function() {
		return app.settings.get('developer') === true;
	};

	app.setDeveloperMode = function(enabled) {
		app.settings.set('developer', enabled === true);
	};

	app.isTest = function() {
		return typeof mocha !== 'undefined';
	};

	app.hasCompletedGettingStarted = function() {
		return app.settings.get('getting-started-complete') === true;
	};

	app.markGettingStartedAsComplete = function() {
		app.settings.set('getting-started-complete', true);
	};

	app.isConfigured = function() {
		return !_.isEmpty(app.settings.getAcceptedCryptoCurrencies());
	};

	app.unlock = function() {
		app.settings.set('lastUnlockTime', Date.now());
	};

	app.lock = function() {
		app.settings.set('lastUnlockTime', null);
	};

	app.isUnlocked = function() {

		// If no PIN is required, then app is always unlocked.
		if (!app.requirePin()) return true;

		var lastUnlockTime = app.settings.get('lastUnlockTime');

		return !!lastUnlockTime && lastUnlockTime > Date.now() - app.config.settingsPin.unlockTime;
	};

	app.requirePin = function() {
		return !!app.settings.get('settingsPin');
	};

	app.checkPin = function(pin) {
		var currentPin = app.settings.get('settingsPin');
		return !!currentPin && pin === currentPin;
	};

	app.setPin = function(pin) {
		app.settings.set('settingsPin', pin);
	};

	app.clearPin = function(pin) {
		app.settings.set('settingsPin', null);
	};

	app.isOnline = function() {
		return app.device.offline !== true;
	};

	app.isOffline = function() {
		return app.device.offline === true;
	};

	app.debugging = function() {
		return app.config.debug === true;
	};

	app.log = function() {
		if (app.debugging()) {
			console.log.apply(console, arguments);
		}
	};

	try {
		app.info = JSON.parse($('#json-info').html());
	} catch (error) {
		app.log(error);
		app.info = {};
	}

})();
