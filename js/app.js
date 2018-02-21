var app = app || {};

(function() {

	app.isConfigured = function() {

		return !_.isEmpty(app.settings.getAcceptedCryptoCurrencies());
	};

	app.unlock = function() {

		app.settings.set('lastUnlockTime', Date.now()).save();
	};

	app.lock = function() {

		app.settings.set('lastUnlockTime', null).save();
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

		app.settings.set('settingsPin', pin).save();
	};

	app.clearPin = function(pin) {

		app.settings.set('settingsPin', null).save();
	};

})();
