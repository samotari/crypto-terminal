var app = app || {};

app.views = app.views || {};

app.views.SettingsGeneral = (function() {

	'use strict';

	return app.views.utility.Form.extend({

		className: 'settings-general',
		template: '#template-settings-general',

		events: {
			'change input[name="configurableCryptoCurrencies[]"]': 'onChangeConfigurableCryptocurrencies',
			'click .set-pin': 'onSetPinClick',
			'click .remove-pin': 'onRemovePinClick',
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
				paymentMethod.accepted = _.contains(configurableCryptoCurrencies, key);
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

			data.hasPin = app.requirePin();

			return data;
		},

		validate: function(data) {

			var errors = [];

			// Check general settings.
			_.each(app.config.settings, function(setting) {
				if (setting.required && !data[setting.name]) {
					errors.push({
						field: setting.name,
						message: app.i18n.t('settings.field-required', {
							label: _.result(setting, 'label')
						}),
					});
				}
				if (setting.validate) {
					try {
						setting.validate(data[setting.name]);
					} catch (error) {
						errors.push({
							field: setting.name,
							message: error,
						});
					}
				}
			});

			// At least one cryptocurrency is required.
			if (_.isEmpty(data.configurableCryptoCurrencies)) {
				errors.push(app.i18n.t('settings.at-least-one-crypto-currency-required'));
			}

			return errors;
		},

		onChangeConfigurableCryptocurrencies: function() {

			var data = _.pick(this.getFormData(), 'configurableCryptoCurrencies');

			// This is necessary to set no configurable cryptocurrencies.
			if (_.isEmpty(data.configurableCryptoCurrencies)) {
				data.configurableCryptoCurrencies = [];
			}

			app.settings.set(data).save();
		},

		save: function(data) {
			app.settings.set(data).save();
		},

		onSetPinClick: function(evt) {

			evt.preventDefault();

			var enterPinView = new app.views.EnterPin({
				title: app.requirePin() ? app.i18n.t('admin.pin.change-pin.title') : app.i18n.t('admin.pin.set-pin.title'),
				closable: true,
			});

			this.listenTo(enterPinView, 'pin', function() {

				// Get keys entered from number pad view.
				var keys = enterPinView.numberPadView.getKeys();

				if (!keys) {
					return app.mainView.showMessage(
						app.i18n.t('admin.pin.min-length'),
						{ minLength: app.config.pin.minLength }
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

		onRemovePinClick: function(evt) {

			evt.preventDefault();
			app.clearPin();
			// Re-render the general settings screen.
			this.render();
		}

	});

})();
