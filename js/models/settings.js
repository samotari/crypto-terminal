var app = app || {};

app.models = app.models || {};

app.models.Settings = (function() {

	'use strict';

	return Backbone.Model.extend({

		defaults: function() {

			var defaults = {
				displayCurrency: 'CZK',
				configurableCryptoCurrencies: [],
			};

			_.each(app.paymentMethods, function(paymentMethod, name) {
				if (!_.isEmpty(paymentMethod.settings)) {
					_.each(paymentMethod.settings, function(setting) {
						defaults[name + '.' + setting.name] = !_.isUndefined(setting.default) ? setting.default : '';
					});
				}
			});

			return defaults;
		},

		localStorageKey: 'settings',

		isConfigured: function() {

			return !_.isEmpty(this.getAcceptedCryptoCurrencies());
		},

		getAcceptedCryptoCurrencies: function() {
			var settings = this.toJSON();
			var configurableCryptoCurrencies = this.get('configurableCryptoCurrencies') || [];
			return _.filter(configurableCryptoCurrencies, function(key) {
				if (!app.paymentMethods[key]) return false;
				var settingsView = new app.views.SettingsPaymentMethod({ key: key });
				// A cryptocurrency is "accepted" if it is configured without validation errors.
				return _.isEmpty(settingsView.validate(settings));
			});
		},

		fetch: function() {

			var data = localStorage.getItem(this.localStorageKey);

			if (data) {
				this.set(JSON.parse(data));
			}
		},

		save: function() {

			var data = this.toJSON();
			localStorage.setItem(this.localStorageKey, JSON.stringify(data));
		},

		destroy: function() {

			this.clear();
			localStorage.removeItem(this.localStorageKey);
		}

	});

})();
