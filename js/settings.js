var app = app || {};

app.settings = (function() {

	'use strict';

	var defaults = {};

	_.each(app.config.settings, function(setting) {
		defaults[setting.name] = _.result(setting, 'default');
	})

	_.each(app.paymentMethods, function(paymentMethod, name) {
		if (!_.isEmpty(paymentMethod.settings)) {
			_.each(paymentMethod.settings, function(setting) {
				defaults[name + '.' + setting.name] = _.result(setting, 'default');
			});
		}
	});

	var settings = _.extend({}, {
		getAcceptedCryptoCurrencies: function() {
			var configurableCryptoCurrencies = this.get('configurableCryptoCurrencies') || [];
			var settings = this.getAll();
			return _.filter(configurableCryptoCurrencies, function(key) {
				if (!app.paymentMethods[key]) return false;
				var settingsView = new app.views.SettingsPaymentMethod({ key: key });
				// A cryptocurrency is "accepted" if it is configured without validation errors.
				return _.isEmpty(settingsView.validate(settings));
			});
		},
		getAll: function() {
			var keys = _.pluck(this.collection.toJSON(), 'key').concat(_.keys(defaults));
			return _.chain(keys).uniq().map(function(key) {
				return [key, this.get(key)];
			}, this).object().value();
		},
		get: function(key) {
			var model = this.collection.findWhere({ key: key });
			var value = model && model.get('value') || null;
			return !_.isNull(value) && value || defaults[key] || null;
		},
		set: function(keyOrValues, value) {

			if (_.isObject(keyOrValues)) {
				_.each(keyOrValues, function(value, key) {
					this.set(key, value);
				}, this);
			} else {
				var key = keyOrValues;
				var model = this.collection.findWhere({ key: key });
				if (model) {
					model.set('value', value).save();
				} else {
					this.collection.add({
						key: key,
						value: value,
					}).save();
				}
			}

			return {
				// For temporary, backwards compatibility.
				save: _.noop,
			};
		}
	}, Backbone.Events);

	app.onDeviceReady(function() {

		// Initialize the settings collection.
		settings.collection = new app.collections.Settings();

		app.queues.onStart.push({
			fn: function(done) {
				settings.collection.on('change:value', function(model) {
					var key = model.get('key');
					var value = model.get('value');
					settings.trigger('change:' + key, value);
					settings.trigger('change');
				});
				settings.collection.fetch({
					success: function() {
						done();
					},
					error: done,
				});
			},
		});
	});

	return settings;

})();
