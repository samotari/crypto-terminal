var app = app || {};

app.views = app.views || {};

app.views.GettingStartedPaymentMethodVerify = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({
		className: 'getting-started getting-started-payment-method-verify',
		template: '#template-getting-started-payment-method-verify',
	});

})();
