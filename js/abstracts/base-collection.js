var app = app || {};

app.abstracts = app.abstracts || {};

app.abstracts.BaseCollection = (function() {

	'use strict';

	return Backbone.Collection.extend({

		// storeName: '<NAME>',

		initialize: function() {

			var storeName = _.result(this, 'storeName') || _.result(this.collection, 'storeName');

			if (!storeName) {
				throw new Error('"storeName" is missing');
			}

			this.localStorage = new Backbone.LocalStorage(storeName);
		},

	});

})();
