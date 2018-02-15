var app = app || {};

app.views = app.views || {};

app.views.SettingsPaymentMethod = (function() {

	'use strict';

	return app.views.utility.Form.extend({

		className: 'settings-payment-method',
		template: '#template-settings-payment-method',

		events: {
			'click .form-field-action': 'onClickAction',
		},

		initialize: function() {

			app.views.utility.Form.prototype.initialize.apply(this, arguments);
			this.paymentMethod = app.paymentMethods[this.options.key];
		},

		onClickAction: function(evt) {

			var $target = $(evt.target);
			var setting = _.findWhere(this.paymentMethod.settings, {
				name: $target.attr('data-setting').split('.').slice(1).join('.')
			});
			if (!setting) return;
			var settingReference = $target.attr('data-setting');
			var action = _.findWhere(setting.actions || [], { name: $target.attr('data-action') });
			if (!action || !action.fn) return;
			var formData = this.getFormData();
			var value = formData[settingReference];
			var $input = this.$(':input[name="' + settingReference + '"]');
			action.fn(value, function(error, newValue) {
				if (error) {
					return app.mainView.showMessage(error);
				}
				$input.val(newValue).trigger('change');
			});
		},

		serializeData: function() {

			var key = this.options.key;
			var data = {
				key: key,
				label: _.result(this.paymentMethod, 'label')
			};
			data.settings = _.map(this.paymentMethod.settings, function(setting) {
				return _.extend(
					{},
					setting,
					{
						id: ['settings', key, setting.name].join('-'),
						name: [key, setting.name].join('.'),
						value: app.settings.get(key + '.' + setting.name) || setting.default,
						visible: setting.visible !== false,
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
						// Call the validate function with context of the payment method.
						setting.validate.call(paymentMethod, data[key + '.' + setting.name]);
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
