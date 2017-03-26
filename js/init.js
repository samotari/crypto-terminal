var app = app || {};

$(function() {
	$('html').removeClass('no-js');
	app.router = new app.Router();
	Backbone.history.start();
	new app.MainView();
});
