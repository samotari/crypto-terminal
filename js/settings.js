var app = app || {};

app.settings = (function() {

	'use strict';

	var defaults = {};

	_.each(app.config.settings, function(setting) {
		setting.path = setting.name;
		defaults[setting.path] = _.result(setting, 'default');
	});

	_.each(app.paymentMethods, function(paymentMethod, key) {
		if (!_.isEmpty(paymentMethod.settings)) {
			paymentMethod.settings = _.map(paymentMethod.settings, function(setting) {
				setting = _.clone(setting);
				setting.path = key + '.' + setting.name;
				defaults[setting.path] = _.result(setting, 'default');
				if (setting.validate) {
					setting.validate = _.bind(setting.validate, paymentMethod);
				}
				if (setting.validateAsync) {
					setting.validateAsync = _.bind(setting.validateAsync, paymentMethod);
				}
				return setting;
			});
		}
	});

	var settings = _.extend({}, {

		doValidation: function(settings, data, done) {

			async.map(settings, function(setting, next) {

				var value = data[setting.path];
				var errors = [];

				if (setting.required && _.isEmpty(value)) {
					errors.push({
						field: setting.path,
						error: app.i18n.t('settings.field-required', {
							label: _.result(setting, 'label')
						}),
					});
				}

				if (setting.validate) {
					try {
						setting.validate(value);
					} catch (error) {
						errors.push({
							field: setting.path,
							error: error,
						});
					}
				}

				if (!setting.validateAsync) {
					return next(null, errors);
				}

				try {
					setting.validateAsync(value, function(error) {
						if (error) {
							errors.push({
								field: setting.path,
								error: error,
							});
						}
						next(null, errors);
					});
				} catch (error) {
					next(error);
				}

			}, function(error, results) {

				if (error) {
					return done(error);
				}

				// Flatten the errors array.
				var errors = Array.prototype.concat.apply([], results);

				done(null, errors);
			});
		},
		getAcceptedCryptoCurrencies: function() {
			var configurableCryptoCurrencies = this.get('configurableCryptoCurrencies') || [];
			return _.filter(configurableCryptoCurrencies, function(key) {
				var paymentMethod = app.paymentMethods[key];
				return paymentMethod && paymentMethod.isConfigured();
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
				settings.collection.on('add update change', function(model) {
					var key = model.get('key');
					var value = model.get('value');
					settings.trigger('change:' + key, value);
					settings.trigger('change', key, value);
				});
				settings.collection.fetch({
					limit: 999,
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
