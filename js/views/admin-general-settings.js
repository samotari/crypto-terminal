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

		inputs: function() {

			return app.config.settings;
		},

		serializeData: function() {

			var data = app.views.utility.Form.prototype.serializeData.apply(this, arguments);
			var configurableCryptoCurrencies = app.settings.get('configurableCryptoCurrencies');
			data.paymentMethods = _.chain(app.paymentMethods).keys().filter(function(key) {
				return _.result(app.paymentMethods[key], 'enabled') === true;
			}).map(function(key) {
				var paymentMethod = _.extend(
					{},
					_.pick(app.paymentMethods[key], 'label'),
					{ key: key }
				);
				paymentMethod.accepted = _.contains(configurableCryptoCurrencies, key);
				return paymentMethod;
			}).value();
			data.hasPin = app.requirePin();
			return data;
		},

		getInputValueOverride: function(key) {

			return app.settings.get(key);
		},

		onChangeConfigurableCryptocurrencies: function() {

			var data = _.pick(this.getFormData(), 'configurableCryptoCurrencies');

			// This is necessary to set no configurable cryptocurrencies.
			if (_.isEmpty(data.configurableCryptoCurrencies)) {
				data.configurableCryptoCurrencies = [];
			}

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

	});

})();
