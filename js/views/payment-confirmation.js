var app = app || {};

app.views = app.views || {};

app.views.PaymentConfirmation = (function() {

	'use strict';

	return Backbone.View.extend({

		className: 'payment-confirmation',

		template: '#template-payment-confirmation',

		events: {
			'click .done': 'done'
		},

		initialize: function(options) {

			this.options = options || {};
		},

		render: function() {

			var html = $(this.template).html();
			var template = Handlebars.compile(html);
			this.$el.html(template());
			return this;
		},

		done: function() {

			// Navigate back to the homescreen
			app.router.navigate('main', { trigger: true });
		},

	});

})();
