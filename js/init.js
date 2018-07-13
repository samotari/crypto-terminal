var app = app || {};

app.onDeviceReady(function() {

	'use strict';

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
			app.device.overrideBackButton();
			app.device.listenToNetworkInformation();

		}
	});

	app.queues.onStart.resume();
});
