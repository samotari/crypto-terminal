var app = app || {};

app.queues = (function() {

	'use strict';

	var queues = {
		onDeviceReady: async.queue(function(task, next) {
			// Synchronous.
			try {
				task.fn();
			} catch (error) {
				app.log(error);
			}
			next();
		}, 1/* concurrency */),
		onStart: async.queue(function(task, next) {
			// Asynchronous.
			task.fn(next);
		}, 1/* concurrency */),
		onReady: async.queue(function(task, next) {
			// Synchronous.
			try {
				task.fn();
			} catch (error) {
				app.log(error);
			}
			next();
		}, 1/* concurrency */),
		whenOnline: async.queue(function(task, next) {
			// Synchronous.
			try {
				task.fn();
			} catch (error) {
				app.log(error);
			}
			next();
		}, 1/* concurrency */),
	};

	// Pause all queues.
	// This prevents execution of queued items until queue.resume() is called.
	_.invoke(queues, 'pause');

	queues.onStart.drain = function() {
		// All on-start callbacks have been executed.
		// Resume the on-ready queue.
		queues.onReady.resume();
		queues.onStart = null;
		app.log('app started');
	};

	queues.onStart.error = function(error) {
		app.log(error);
	};

	$(function() {
		if (!app.isCordova()) {
			queues.onDeviceReady.resume();
		}
	});

	// The "deviceready" event fires after cordova has finished loading and the device is ready.
	document.addEventListener('deviceready', function() {
		queues.onDeviceReady.resume();
	});

	// Prepare shortcuts.
	_.each(_.keys(queues), function(key) {
		app[key] = function(fn) {
			queues[key].push({ fn: fn });
		};
	});

	app.onDeviceReady(function() {
		// Online/offline.
		async.forever(function(next) {
			if (app.isOnline()) {
				if (queues.whenOnline.paused) {
					app.log('CONNECTION: online');
					queues.whenOnline.resume();
				}
			} else if (app.isOffline()) {
				if (!queues.whenOnline.paused) {
					app.log('CONNECTION: offline');
					queues.whenOnline.pause();
				}
			}
			_.delay(next, 50);
		});
	});

	return queues;

})();
