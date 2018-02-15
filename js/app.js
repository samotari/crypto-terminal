var app = app || {};

(function() {

	'use strict';

	app.isCordova = function() {

		return typeof cordova !== 'undefined';
	};

	app.isTest = function() {

		return typeof mocha !== 'undefined';
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

	app.log = function() {

		if (app.config.debug) {
			console.log.apply(console, arguments);
		}
	};

	try {
		app.info = JSON.parse(app.info);
	} catch (error) {
		app.log(error);
	}

})();
