var app = app || {};

app.views = app.views || {};

app.views.GettingStartedChoosePaymentMethods = (function() {

	'use strict';

	return app.views.utility.Form.extend({

		className: 'getting-started getting-started-choose-payment-methods',
		template: '#template-getting-started-choose-payment-methods',

		events: {
			'change input[name="configurableCryptoCurrencies[]"]': 'onChangeConfigurableCryptocurrencies',
		},

		serializeData: function() {

			var data = {
				isComplete: this.isComplete(),
			};
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

			return data;
		},

		onChangeConfigurableCryptocurrencies: function() {

			var data = _.pick(this.getFormData(), 'configurableCryptoCurrencies');

			// This is necessary to set no configurable cryptocurrencies.
			if (_.isEmpty(data.configurableCryptoCurrencies)) {
				data.configurableCryptoCurrencies = [];
			}

			app.settings.set(data);
		},

		isComplete: function() {

			var data = this.getFormData();
			return !_.isEmpty(data.configurableCryptoCurrencies);
		},

	});

})();
