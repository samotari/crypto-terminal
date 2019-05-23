var app = app || {};

app.onDeviceReady(function() {

	'use strict';

	$('html').removeClass('no-js');

	// Register partial templates with handlebars.
	Handlebars.registerPartial('amount', $('#template-amount').html());
	Handlebars.registerPartial('formField', $('#template-form-field').html());
	Handlebars.registerPartial('formFieldRow', $('#template-form-field-row').html());
	Handlebars.registerPartial('slider', $('#template-slider').html());

	// Initialize collections and models.
	app.paymentRequests = new app.collections.PaymentRequests();

	app.onReady(function() {

		app.paymentRequests.fetch();

		// Initialize the main view.
		app.mainView = new app.views.Main();

		app.device.initialize();

		$('html').addClass('loaded');

		// Initialize the router.
		app.router = new app.Router();

		// Don't initialize backbone history when testing.
		if (!app.isTest()) {
			// Start storing in-app browsing history.
			Backbone.history.start();
		}
	});

	app.queues.onStart.resume();
});
