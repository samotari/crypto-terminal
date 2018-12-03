var app = app || {};

app.abstracts = app.abstracts || {};

app.abstracts.BaseCollection = (function() {

	'use strict';

	return Backbone.Collection.extend({

		// storeName: '<NAME>',

		// Internal counter for the total number of models stored in this collection's db table.
		// This is used in the case of SQLite storage.
		total: function() {
			return this.length;
		},

		initialize: function() {

			var storeName = _.result(this, 'storeName') || _.result(this.collection, 'storeName');

			if (!storeName) {
				throw new Error('"storeName" is missing');
			}

			if (app.sqlite) {
				this.sqliteStore = new app.sqlite.Store(storeName);
			}

			this.localStorage = new Backbone.LocalStorage(storeName);
		},

	});

})();
