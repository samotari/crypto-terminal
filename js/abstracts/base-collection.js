var app = app || {};

app.abstracts = app.abstracts || {};

app.abstracts.BaseCollection = (function() {

	'use strict';

	return Backbone.Collection.extend({

		// storeName: '<NAME>',

		initialize: function() {

			var storeName = _.result(this, 'storeName') || _.result(this.collection, 'storeName');

			if (!storeName) {
				throw new Error('Failed to initialize model, because store name is missing.');
			}

			if (app.sqlite) {
				this.sqliteStore = new app.sqlite.Store(storeName);
			} else {
				this.localStorage = new Backbone.LocalStorage(storeName);
			}
		},

		fetched: false,
		fetch: function(options) {
			options = _.defaults(options || {}, {
				force: false,
			});
			if (!options.force && this.fetched) return;
			this.fetched = true;
			options = _.omit(options, 'force');
			return Backbone.Collection.prototype.fetch.call(this, options);
		},

	});

})();
