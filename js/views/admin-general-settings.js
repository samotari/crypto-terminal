var app = app || {};

app.views = app.views || {};

app.views.AdminGeneralSettings = (function() {

	'use strict';

	return app.views.utility.Form.extend({

		className: 'admin-general-settings',
		template: '#template-admin-general-settings',

		events: {
			'change input[name="configurableCryptoCurrencies[]"]': 'onChangeConfigurableCryptocurrencies',
			'click .set-pin': 'setPin',
			'click .remove-pin': 'removePin',
		},

		serializeData: function() {

			var data = {};
			var configurableCryptoCurrencies = app.settings.get('configurableCryptoCurrencies');
			data.paymentMethods = _.map(_.keys(app.paymentMethods), function(key) {
				var paymentMethod = _.extend(
					{},
					_.pick(app.paymentMethods[key], 'label', 'settings'),
					{ key: key }
				);
				paymentMethod.settings = _.map(paymentMethod.settings, function(setting) {
					var options = _.result(setting, 'options') || null;
					return _.extend(
						{},
						setting,
						{ options: options },
						{
							id: ['settings', key, setting.name].join('-'),
							name: [key, setting.name].join('.'),
							value: app.settings.get(key + '.' + setting.name) || setting.default,
						}
					);
				});
				paymentMethod.accepted = _.contains(configurableCryptoCurrencies, key);
				return paymentMethod;
			});

			data.settings = this.prepareGenearalSettings();
			data.hasPin = app.requirePin();

			return data;
		},

		validate: function(data, done) {

			app.settings.doValidation(app.config.settings, data, function(error, validationErrors) {

				if (error) {
					// An unexpected error.
					return done(error);
				}

				done(null, validationErrors);
			});
		},

		onChangeConfigurableCryptocurrencies: function() {

			var data = _.pick(this.getFormData(), 'configurableCryptoCurrencies');

			// This is necessary to set no configurable cryptocurrencies.
			if (_.isEmpty(data.configurableCryptoCurrencies)) {
				data.configurableCryptoCurrencies = [];
			}

			app.settings.set(data);
		},

		save: function(data) {

			app.settings.set(data);
		},

		setPin: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			var enterPinView = new app.views.EnterPin({
				title: app.requirePin() ? app.i18n.t('admin.pin.change-pin.title') : app.i18n.t('admin.pin.set-pin.title'),
				closable: false,
			});

			this.listenTo(enterPinView, 'pin', function() {

				// Get keys entered from number pad view.
				var keys = enterPinView.numberPadView.getKeys();

				if (!keys) {
					return app.mainView.showMessage(
						app.i18n.t('admin.pin.min-length', {
							minLength: app.config.settingsPin.minLength
						})
					);
				}

				// Save the new PIN.
				app.setPin(keys);

				// Close the enter PIN view.
				enterPinView.close();

				// Unlock the settings screen.
				app.unlock();

				// Re-render the general settings screen.
				this.render();
			});

			this.listenTo(enterPinView, 'close', function() {
				this.stopListeningTo(enterPinView);
			});
		},

		removePin: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			app.clearPin();
			// Re-render the general settings screen.
			this.render();
		},

		prepareGenearalSettings: function() {
			// Prepare general settings for the template.
			return _.map(app.config.settings, function(setting) {
				setting = _.clone(setting);
				setting.options = _.result(setting, 'options') || null;
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
			})
		}

	});

})();
