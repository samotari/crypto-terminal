var app = app || {};

app.cache = (function() {

	'use strict';

	var model = (function() {
		var Model = Backbone.Model.extend({
			localStorage: new Backbone.LocalStorage('cache'),
		});
		var model = new Model({
			id: 'cache',
		});
		return model;
	})();

	app.queues.onStart.push({
		fn: function(done) {
			model.fetch({
				success: function() {
					done();
				},
				error: done,
			});
		}
	});

	return {
		model: model,
		clear: function(key) {
			this.model.set(key, null).save();
		},
		clearAll: function() {
			this.model.clear().save();
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

})();
