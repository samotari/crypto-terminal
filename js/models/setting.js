var app = app || {};

app.models = app.models || {};

app.models.Setting = (function() {

	'use strict';

	return Backbone.Model.extend({
		idAttribute: 'key',
	});

})();
