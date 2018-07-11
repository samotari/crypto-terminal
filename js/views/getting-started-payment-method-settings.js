var app = app || {};

app.views = app.views || {};

app.views.GettingStartedPaymentMethodSettings = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({
		className: 'getting-started getting-started-payment-method-settings',
		template: '#template-getting-started-payment-method-settings',
		serializeData: function() {
			var key = this.options.key;
			return {
				title: app.i18n.t('getting-started.payment-method-settings.' + key + '.title'),
				instructions: app.i18n.t('getting-started.payment-method-settings.' + key + '.instructions'),
			};
		},
	});

})();
