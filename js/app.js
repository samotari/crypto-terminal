var app = app || {};

(function() {

	'use strict';

	app.createWorker = function(fileName) {
		var worker = new Worker(fileName);
		var callers = {};
		worker.addEventListener('message', function(evt) {
			var id = evt.data.id;
			var error = evt.data.error;
			var result = evt.data.result;
			var caller = callers[id] || null;
			delete callers[id];
			caller && caller(error, result);
		}, false);
		return {
			call: function(fn, args, cb) {
				var id = _.uniqueId('worker');
				callers[id] = cb;
				worker.postMessage({
					id: id,
					fn: fn,
					args: args,
				});
			}
		};
	};

	app.busy = function(isBusy) {
		$('html').toggleClass('busy', isBusy !== false);
	};

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
		app.info = app.info && JSON.parse(app.info) || {};
	} catch (error) {
		app.log(error);
	}

})();
