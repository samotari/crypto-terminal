var app = app || {};

app.views = app.views || {};

app.views.PaymentTimedOut= (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'payment-timed-out',

		template: '#template-payment-timed-out',

		events: {
			'quicktouch .done': 'done',
		},

		done: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			// Navigate back to the homescreen
			app.router.navigate('main', { trigger: true });
		},

		onBackButton: function() {

			this.done();
		}

	});

})();