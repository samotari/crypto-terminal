var app = app || {};

app.views = app.views || {};

app.views.GettingStartedPaymentMethodSettings = (function() {

	'use strict';

	return app.views.AdminPaymentMethodSettings.extend({

		className: 'getting-started getting-started-payment-method-settings',
		template: '#template-getting-started-payment-method-settings',

		title: function() {

			return this.paymentMethod && _.result(this.paymentMethod, 'label');
		},

		serializeData: function() {

			return app.views.utility.Form.prototype.serializeData.apply(this, arguments);
		},

		isComplete: function() {

			return this.paymentMethod.isConfigured();
		},

		onBackButton: null,

	});

})();
