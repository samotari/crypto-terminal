var app = app || {};

app.models = app.models || {};

app.models.Settings = (function() {

	'use strict';

	return Backbone.Model.extend({

		defaults: function() {

			var defaults = {
				displayCurrency: 'CZK',
				acceptCryptoCurrencies: [],
				configured: '0'
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

			return this.get('configured') === '1';
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
