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
					errors.push({
						field: key + '.' + setting.name,
						message: errorMessagePrefix + app.i18n.t('settings.field-required', {
							label: _.result(setting, 'label')
						}),
					});
				}
				if (setting.validate) {
					try {
						setting.validate(data[key + '.' + setting.name]);
					} catch (error) {
						errors.push({
							field: key + '.' + setting.name,
							message: errorMessagePrefix + error,
						});
					}
				}
			});

			return errors;
		},

		save: function(data) {

			app.settings.set(data);
		}

	});

})();
