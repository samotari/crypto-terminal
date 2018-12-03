var app = app || {};

app.cache = (function() {

	'use strict';

	var model = new app.models.Cache({ id: 'cache' });

	var cache = {
		model: model,
		clear: function(key) {
			this.model.set(key, null).save();
		},
		clearAll: function() {
			var attributes = {
				id: this.model.attributes.id,
			};
			this.model.attributes = attributes;
			this.model.save();
		},
		clearOlderThan: function(maxAge) {
			maxAge = maxAge || 0;
			var now = Date.now();
			var attributes = _.chain(this.model.toJSON()).map(function(item, key) {
				var keep = !!item && (!_.isObject(item) || !item.timestamp || (now - item.timestamp) <= maxAge);
				return keep ? [key, item] : null;
			}).compact().object().value();
			this.model.attributes = attributes;
			this.model.save();
		},
		get: function(key, maxAge) {
			var data;
			var item = this.model.get(key);
			if (item) {
				var expired = maxAge && Date.now() - item.timestamp > maxAge;
				if (!expired) {
					data = item.data;
				}
			}
			return data || null;
		},
		set: function(key, data) {
			this.model.set(key, {
				timestamp: Date.now(),
				data: data,
			}).save();
		}
	};

	app.onStart(function(done) {
		model.fetch({
			success: function() {
				done();
			},
			error: done,
		});
	});

	app.onStart(function(done) {
		try {
			cache.clearOlderThan(app.config.cache.onAppStartClearOlderThan);
		} catch (error) {
			app.log(error);
		}
		done();
	});

	return cache;

})();
