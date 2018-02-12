var app = app || {};

app.views = app.views || {};

app.views.SettingsPaymentMethod = (function() {

	'use strict';

	return app.views.utility.Form.extend({

		className: 'settings-payment-method',
		template: '#template-settings-payment-method',

		serializeData: function() {

			var key = this.options.key;
			var data = {
				key: key,
				label: _.result(app.paymentMethods[key], 'label')
			};
			data.settings = _.map(app.paymentMethods[key].settings, function(setting) {
				return _.extend(
					{},
					setting,
					{
						id: ['settings', key, setting.name].join('-'),
						name: [key, setting.name].join('.'),
						value: app.settings.get(key + '.' + setting.name) || setting.default,
					}
				);
			});
			return data;
		},

		validate: function(data) {

			var errors = [];
			var key = this.options.key;
			var paymentMethod = app.paymentMethods[key];
			var errorMessagePrefix = '[' + _.result(paymentMethod, 'label') + '] ';

			_.each(paymentMethod.settings, function(setting) {
				if (setting.required && !data[key + '.' + setting.name]) {
					errors.push(errorMessagePrefix + app.i18n.t('settings.field-required', {
						label: _.result(setting, 'label')
					}));
				}
				if (setting.validate) {
					try {
						setting.validate(data[key + '.' + setting.name]);
					} catch (error) {
						errors.push(errorMessagePrefix + error);
					}
				}
			});

			return errors;
		},

		onSubmit: function(evt) {

			evt.preventDefault();
			this.clearErrors();
			var data = this.$('form').serializeJSON();
			var errors = this.validate(data);
			var save = _.bind(this.save, this);
			var key = this.options.key;
			var paymentMethod = app.paymentMethods[key];

			if (!_.isEmpty(errors)) {
				this.showErrors(errors);
			} else {
				// No errors.

				app.mainView.busy();

				async.eachSeries(paymentMethod.settings, function(setting, next) {
					if (setting.beforeSaving) {
						setting.beforeSaving.call(paymentMethod, data, function(error, fixedData) {
							if (error) {
								next(error);
							} else {

								data = fixedData;
								next();
							}
						});
					} else {
						next();
					}
				}, function(error) {

					app.mainView.notBusy();

					if (error) {
						throw new Error(error);
					}

					save(data);

				})

			}

		},

		save: function(data) {
			app.settings.set(data).save();
		}

	});

})();
