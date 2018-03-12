var app = app || {};

document.addEventListener('DOMContentLoaded', function() {
	// Initialize the FastClick library.
	FastClick.attach(document.body);
});

app.onDeviceReady(function() {

	'use strict';

	/*
		See:
		https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-inappbrowser/
	*/
	if (app.isCordova()) {
		window.open = cordova.InAppBrowser.open;
	}

	$('html').removeClass('no-js');

	// Register partial templates with handlebars.
	Handlebars.registerPartial('amount', $('#template-amount').html());
	Handlebars.registerPartial('formField', $('#template-form-field').html());
	Handlebars.registerPartial('slider', $('#template-slider').html());

	// Initialize collections and models.
	app.paymentRequests = new app.collections.PaymentRequests();

	app.queues.onReady.push({
		fn: function() {
			// Initialize the main view.
			app.mainView = new app.views.Main();

			// Initialize the router.
			app.router = new app.Router();

			// Don't initialize backbone history when testing.
			if (!app.isTest()) {
				// Start storing in-app browsing history.
				Backbone.history.start();
			}

			$('html').addClass('loaded');
			$('#cover-text').text('');
		}
	});

	app.queues.onStart.resume();
});
