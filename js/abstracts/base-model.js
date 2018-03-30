var app = app || {};

app.abstracts = app.abstracts || {};

app.abstracts.BaseModel = (function() {

	'use strict';

	return Backbone.Model.extend({

		isSaved: function() {

			var idAttribute = _.result(this, 'idAttribute');
			return !!this.get(idAttribute);
		},

	});

})();