var app = app || {};

app.views = app.views || {};

app.views.Pay = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'pay',

		template: '#template-pay-enter-amount',

		events: {
			'mousedown .numpad-key': 'onNumberPadKeyMouseDown',
			'mouseup .numpad-key': 'onNumberPadKeyMouseUp',
			'touchstart .numpad-key': 'onNumberPadKeyTouchStart',
			'touchend .numpad-key': 'onNumberPadKeyTouchEnd',
			'click .continue': 'continue'
		},

		amount: '0',

		initialize: function() {

			_.bindAll(this, 'onLongTouch');
		},

		serializeData: function() {

			return {
				amount: {
					display: {
						value: this.amount,
						currency: app.settings.get('displayCurrency')
					}
				}
			};
		},

		onRender: function() {

			this.$amount = this.$('.amount-value');
			this.$error = this.$('.error');
			this.updateAmountElement();
		},

		onNumberPadKeyTouchStart: function(evt) {

			evt.preventDefault();
			var $target = $(evt.target);
			// Give the target key the "pressed" class name temporarily.
			// This gives the user some visual feedback.
			$target.addClass('pressed');

			// When the user presses and holds a key.
			// Wait a moment and then start executing the key press repeatedly.
			this._longNumPadKeyTouch = false;
			this._longNumPadKeyTouchTimeout = setTimeout(this.onLongTouch, 500);
		},

		onLongTouch: function() {

			var $target = this.$('.numpad-key.pressed');

			this._longNumPadKeyTouch = true;

			var test = _.bind(function() {
				return !this._longNumPadKeyTouch;
			}, this);

			var iteratee = _.bind(function(next) {

				if ($target.hasClass('backspace')) {
					this.removeLastCharacterFromAmount();
				} else {
					var value = $target.attr('data-value');
					this.addToAmount(value);
				}

				_.delay(next, 75);

			}, this);

			async.until(test, iteratee);
		},

		onNumberPadKeyTouchEnd: function(evt) {

			evt.preventDefault();
			var $target = $(evt.target);
			$target.removeClass('pressed');

			if (!this._longNumPadKeyTouch) {
				if ($target.hasClass('backspace')) {
					this.removeLastCharacterFromAmount();
				} else {
					var value = $target.attr('data-value');
					this.addToAmount(value);
				}
			}

			this._longNumPadKeyTouch = false;
			if (this._longNumPadKeyTouchTimeout) {
				clearTimeout(this._longNumPadKeyTouchTimeout);
			}
		},

		onNumberPadKeyMouseUp: function(evt) {

			evt.preventDefault();
			var $target = $(evt.target);
			if ($target.hasClass('backspace')) {
				this.removeLastCharacterFromAmount();
			} else {
				var value = $target.attr('data-value');
				this.addToAmount(value);
			}
		},

		removeLastCharacterFromAmount: function() {

			if (this.amount.length > 0) {
				// Remove the last character from the amount string.
				this.amount = this.amount.substr(0, this.amount.length - 1);
			}

			this.updateAmountElement();
		},

		addToAmount: function(value) {

			if (
				// Don't add if there is no value:
				!value ||
				// In the case of a dot, only add if there isn't already a dot:
				(value === '.' && this.amount.indexOf('.') !== -1)
			) {
				return;
			}

			// Append the value to the end of the amount string.
			this.amount += value;

			// Update the amount shown in the UI.
			this.updateAmountElement();
		},

		updateAmountElement: function() {

			var amount = this.amount || '0';

			// Remove extra leading zeroes.
			amount = amount.replace(/^0{2,}/, '0').replace(/^0([^\\.])/, '$1');

			this.$amount.text(amount);
		},

		continue: function() {

			var amount;

			this.clearError();

			try {
				amount = new BigNumber(this.amount);
			} catch (error) {
				return this.showError(app.i18n.t('pay-enter-amount.valid-number'));
			}

			if (!amount.greaterThan(0)) {
				return this.showError(app.i18n.t('pay-enter-amount.greater-than-zero'));
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
