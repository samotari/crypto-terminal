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

		title: function() {

			return app.i18n.t('getting-started.choose-payment-methods.title');
		},

		serializeData: function() {

			var data = app.views.utility.Form.prototype.serializeData.apply(this, arguments);
			data.isComplete = this.isComplete();
			var configurableCryptoCurrencies = app.settings.get('configurableCryptoCurrencies');
			data.paymentMethods = _.chain(app.paymentMethods).keys().filter(function(key) {
				return _.result(app.paymentMethods[key], 'enabled') === true;
			}).map(function(key) {
				var paymentMethod = _.extend(
					{},
					_.pick(app.paymentMethods[key], 'label', 'settings'),
					{ key: key }
				);
				paymentMethod.accepted = _.contains(configurableCryptoCurrencies, key);
				return paymentMethod;
			}).value();

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
