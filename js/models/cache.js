var app = app || {};

app.models = app.models || {};

app.models.Cache = (function() {

	'use strict';

	return app.abstracts.BaseModel.extend({
		localStorage: new Backbone.LocalStorage('cache'),
		url: _.noop,
	});

})();
