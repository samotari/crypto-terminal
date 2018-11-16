var app = app || {};

app.queues = (function() {

	'use strict';

	var queues = {
		onDeviceReady: async.queue(function(task, next) {
			// Synchronous.
			task.fn();
			next();
		}, 1/* concurrency */),
		onStart: async.queue(function(task, next) {
			// Asynchronous.
			task.fn(next);
		}, 1/* concurrency */),
		onReady: async.queue(function(task, next) {
			// Synchronous.
			task.fn();
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

	_.each(_.keys(queues), function(key) {
		app[key] = function(fn) {
			app.queues[key].push({ fn: fn });
		};
	});

	$(function() {
		if (!app.isCordova()) {
			app.queues.onDeviceReady.resume();
		}
	});

	// The "deviceready" event fires after cordova has finished loading and the device is ready.
	document.addEventListener('deviceready', function() {
		app.queues.onDeviceReady.resume();
	});

	return queues;

})();
