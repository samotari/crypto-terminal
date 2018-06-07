(function() {

	var localStorageSync = Backbone.sync;

	var getDeferred = function() {

		if (Backbone.$) {
			return _.result(Backbone.$, 'Deferred', false);
		}

		return _.result(Backbone, 'Deferred', false);
	};

	/*
		!! TODO !!
		This custom sync method doesn't work properly when fetching an individual record. Example:
			this.model = new app.paymentRequests.model({ id: this.options.paymentId });
			this.model.on('sync change', this.render);
			this.model.fetch();

		Suggested approach to find a fix is to copy the backbone-localstorage sync method here with added logging to determine the proper signature for callbacks.
	*/

	Backbone.sync = function(method, model, options) {

		var sqliteStore = this.sqliteStore || this.collection && this.collection.sqliteStore;
		var useSqlite = !!app.sqlite && !!sqliteStore;

		// Fallback to LocalStorage sync method.
		if (!useSqlite) return localStorageSync.apply(this, arguments);

		options = _.clone(options || {});
		var store = sqliteStore;
		var storeMethodOptions = _.pick(options, 'limit', 'offset');
		var deferred = getDeferred();
		var models = this.models || null;

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
					// Combine the result with the existing models in the collection.
					if (models) {
						result = models.concat(result);
					}
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
