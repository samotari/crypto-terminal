var app = app || {};

app.models = app.models || {};

app.models.Setting = (function() {

	'use strict';

	return app.abstracts.BaseModel.extend({
		idAttribute: 'key',
	});

})();
