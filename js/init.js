var app = app || {};

app.onDeviceReady(function() {

	'use strict';

	FastClick.attach(document.body);

	var $html = $('html');

	$html.removeClass('no-js');

	// Register partial templates with handlebars.
	Handlebars.registerPartial('amount', $('#template-amount').html());
	Handlebars.registerPartial('formField', $('#template-form-field').html());
	Handlebars.registerPartial('slider', $('#template-slider').html());

	app.queues.onReady.push({
		fn: function() {
			// Initialize collections and models.
			app.paymentRequests = new app.collections.PaymentRequests();

			// Initialize the main view.
			app.mainView = new app.views.Main();

			// Initialize the router.
			app.router = new app.Router();

			// Start storing in-app browsing history.
			Backbone.history.start();
		}
	});

	app.queues.onStart.resume();
});
