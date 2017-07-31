var app = app || {};

$(function() {

	'use strict';

	$('html').removeClass('no-js');

	// Register partial templates with handlebars.
	Handlebars.registerPartial('numpad', $('#template-numpad').html());
	Handlebars.registerPartial('amount', $('#template-amount').html());

	// Initialize models.
	app.settings = new app.models.Settings();
	app.settings.fetch();

	// Initialize collections
	app.paymentRequests = new app.collections.PaymentRequests();

	// Initialize the main view.
	app.mainView = new app.views.Main();
	app.mainView.render();

	// Initialize the router.
	app.router = new app.Router();

	// Start storing in-app browsing history.
	Backbone.history.start();
});
