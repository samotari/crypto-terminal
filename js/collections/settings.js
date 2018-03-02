var app = app || {};

app.collections = app.collections || {};

app.collections.Settings = (function() {

	'use strict';

	return app.abstracts.BaseCollection.extend({
		model: app.models.Setting,
		storeName: 'settings',
	});

})();
