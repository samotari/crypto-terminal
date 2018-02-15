var app = app || {};

$(function() {

	'use strict';

	FastClick.attach(document.body);

	$('html').removeClass('no-js');

	// Register partial templates with handlebars.
	Handlebars.registerPartial('numpad', $('#template-numpad').html());
	Handlebars.registerPartial('amount', $('#template-amount').html());
	Handlebars.registerPartial('formField', $('#template-form-field').html());
	Handlebars.registerPartial('slider', $('#template-slider').html());

	// Initialize models.
	app.settings = new app.models.Settings();
	app.settings.fetch();

	// Initialize collections
	app.paymentRequests = new app.collections.PaymentRequests();

	// Initialize the main view.
	app.mainView = new app.views.Main();

	// Initialize the router.
	app.router = new app.Router();

	// Start storing in-app browsing history.
	Backbone.history.start();
});
