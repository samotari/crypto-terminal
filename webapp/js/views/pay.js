var app = app || {};

app.views = app.views || {};

app.views.Pay = (function() {

	'use strict';

	return Backbone.View.extend({

		className: 'pay',

		template: '#template-pay-enter-amount',

		events: {
			'click .numpad-key': 'onNumberPadKeyPressed',
			'click .continue': 'continue'
		},

		amount: '0',

		render: function() {

			var html = $(this.template).html();
			var template = Handlebars.compile(html);
			var data = {
				amount: {
					display: {
						value: this.amount,
						currency: app.settings.get('displayCurrency')
					}
				}
			};

			this.$el.html(template(data));
			this.$amount = this.$('.amount-value');
			this.$error = this.$('.error');
			this.updateAmount();
			return this;
		},

		onNumberPadKeyPressed: function(evt) {

			var $target = $(evt.target);

			if ($target.hasClass('backspace')) {

				if (this.amount.length > 0) {
					// Remove the last character from the amount string.
					this.amount = this.amount.substr(0, this.amount.length - 1);
				}

			} else {

				var value = $target.attr('data-value');

				if (value !== '.' || this.amount.indexOf('.') === -1) {
					// In the case of a dot, only append if there isn't already a dot.
					// Append the value to the end of the amount string.
					this.amount += value;
				}
			}

			this.updateAmount();
		},

		updateAmount: function() {

			var amount = this.amount || '0';

			// Remove extra leading zeroes.
			amount = amount.replace(/^0{2,}/, '0').replace(/^0([^\.])/, '$1');

			this.$amount.text(amount);
		},

		continue: function() {

			var amount;

			this.clearError();

			try {
				amount = new BigNumber(this.amount);
			} catch (error) {
				return this.showError('Amount must be a valid number');
			}

			if (!amount.greaterThan(0)) {
				return this.showError('Amount must be greater than zero.');
			}

			// Navigate to the next screen with the amount in the URI.
			app.router.navigate('pay/' + encodeURIComponent(amount.toString()), { trigger: true });
		},

		clearError: function() {

			this.$error.text('');
		},

		showError: function(error) {

			this.$error.text(error);
		}

	});

})();
