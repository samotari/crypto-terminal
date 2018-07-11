var app = app || {};

app.views = app.views || {};

app.views.GettingStartedChoosePaymentMethods = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({
		className: 'getting-started getting-started-choose-payment-methods',
		template: '#template-getting-started-choose-payment-methods',
	});

})();
