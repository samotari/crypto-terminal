var app = app || {};

app.views = app.views || {};

app.views.Settings = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'settings',
		template: '#template-settings',

		events: {
			'change input[name="acceptCryptoCurrencies[]"]': 'toggleCryptoCurrencySettingsVisibility',
			'submit form': 'saveSettings'
		},

		initialize: function() {

			_.bindAll(this, 'clearSuccess');
		},

		serializeData: function() {

			var data = {};
			var acceptCryptoCurrencies = app.settings.get('acceptCryptoCurrencies');
			data.paymentMethods = _.map(_.keys(app.paymentMethods), function(key) {
				var paymentMethod = _.extend(
					{},
					_.pick(app.paymentMethods[key], 'label', 'settings'),
					{ key: key }
				);
				paymentMethod.settings = _.map(paymentMethod.settings, function(setting) {
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
				paymentMethod.accepted = _.contains(acceptCryptoCurrencies, key);
				return paymentMethod;
			});

			// Prepare general settings for the template.
			data.settings = _.map(app.config.settings, function(setting) {
				switch (setting.type) {
					case 'select':
						setting.options = _.map(setting.options || [], function(option) {
							return {
								key: option.key,
								label: _.result(option, 'label'),
								selected: app.settings.get(setting.name) === option.key
							}
						});
						break;

					default:
						setting.value = app.settings.get(setting.name);
						break;
				}
				setting.id = ['settings', setting.name].join('-');
				return setting;
			});

			return data;
		},

		onRender: function() {

			this.$error = this.$('.error');
			this.$success = this.$('.success');
		},

		toggleCryptoCurrencySettingsVisibility: function(evt) {

			var $target = $(evt.target);
			var key = $target.attr('value');
			var method = $target.is(':checked') ? 'show' : 'hide';
			this.$('.form-group.' + key)[method]();
			this.toggleSaveButtonVisibility();
		},

		toggleSaveButtonVisibility: function() {

			var method = this.$(':input[name="acceptCryptoCurrencies[]"]:checked') ? 'show' : 'hide';
			this.$('.form-button.save')[method]();
		},

		showSuccess: function(message) {

			this.$success.text(message);
			_.delay(this.clearSuccess, 5000);
		},

		clearSuccess: function() {

			this.$success.empty();
		},

		showErrors: function(errors) {

			var errorText = errors.join('\n');
			this.$error.text(errorText);
		},

		clearErrors: function() {

			this.$error.empty();
		},

		saveSettings: function(evt) {

			evt.preventDefault();
			this.clearErrors();
			var data = this.$('form').serializeJSON();
			var errors = this.validate(data);

			if (!_.isEmpty(errors)) {
				this.showErrors(errors);
			} else {
				// No errors.
				// Try saving the settings.
				data.configured = '1';
				app.settings.set(data).save();
				this.showSuccess(app.i18n.t('settings.save-success'));
			}
		},

		validate: function(data) {

			var errors = [];

			// Check general settings.
			_.each(app.config.settings, function(setting) {
				if (setting.required && !data[setting.name]) {
					errors.push(app.i18n.t('settings.field-required', {
						label: _.result(setting, 'label')
					}));
				}
				if (setting.validate) {
					try {
						setting.validate(data[setting.name]);
					} catch (error) {
						errors.push(error);
					}
				}
			});

			// Check required fields for each accepted cryptocurrency.
			_.each(data.acceptCryptoCurrencies, function(key) {
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
			});

			// Make sure at least one cryptocurrency is accepted.
			if (_.isEmpty(data.acceptCryptoCurrencies)) {
				errors.push(app.i18n.t('settings.at-least-one-crypto-currency-required'));
			}

			return errors;
		}

	});

})();
