(function() {

	var localStorageSync = Backbone.sync;

	var getDeferred = function() {

		if (Backbone.$) {
			return _.result(Backbone.$, 'Deferred', false);
		}

		return _.result(Backbone, 'Deferred', false);
	};

	Backbone.sync = function(method, model, options) {

		// If SQLite isn't available, fallback to LocalStorage sync method.
		if (!app.sqlite) return localStorageSync.apply(this, arguments);

		options = _.clone(options || {});
		var store = this.sqliteStore || this.collection.sqliteStore;
		var storeMethodOptions = _.pick(options, 'limit', 'offset');
		var deferred = getDeferred();

		_.defer(function() {
			var storeMethod;
			switch (method) {
				case 'read':
					storeMethod = _.isUndefined(model.id) ? 
						_.bind(store.findAll, store, storeMethodOptions) :
						_.bind(store.find, store, model);
					break;
				case 'create':
					storeMethod = _.bind(store.create, store, model);
					break;
				case 'patch':
				case 'update':
					storeMethod = _.bind(store.update, store, model);
					break;
				case 'delete':
					storeMethod = _.bind(store.destroy, store, model);
					break;
			}
			storeMethod(function(error, result) {
				if (error) {
					if (options.error) {
						options.error.call(model, error, options);
					}
					if (deferred) {
						deferred.reject(error);
					}
				} else {
					if (options.success) {
						options.success.call(model, result, options);
					}
					if (deferred) {
						deferred.resolve(result);
					}
				}
				// add compatibility with $.ajax
				// always execute callback for success and error
				if (options.complete) {
					options.complete.call(model, result);
				}
			});
		});

		return deferred && deferred.promise();
	};

})();
