var app = app || {};

app.views = app.views || {};

app.views.PaymentConfirmation = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'payment-confirmation',

		template: '#template-payment-confirmation',

		events: {
			'click .done': 'done'
		},

		done: function() {

			// Navigate back to the homescreen
			app.router.navigate('main', { trigger: true });
		}

	});

})();
