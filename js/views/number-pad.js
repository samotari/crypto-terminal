var app = app || {};

app.views = app.views || {};

app.views.NumberPad = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'number-pad',

		template: '#template-number-pad',

		events: {
			'click .number-pad-key': 'onClickNumberKey',
			'longtouchstart .number-pad-key': 'onLongTouchStartNumberKey',
			'longtouchend .number-pad-key': 'onLongTouchEndNumberKey',
		},

		initialize: function() {

			this.options = _.defaults(this.options || {}, {
				initialKeys: '',
				decimal: true,
				numberFormat: 'default',
			});

			this.numberFormatConfig = app.util.getNumberFormatConfig(this.options.numberFormat);

			// Use a model to store the state.
			this.model = new Backbone.Model();

			// Set the keys string with an initial value.
			this.model.set('keys', this.options.initialKeys);
		},

		serializeData: function() {

			return {
				useDecimal: this.options.decimal,
				decimalSeparator: this.getDecimalSeparator(),
			};
		},

		onLongTouchStartNumberKey: function(evt) {

			this.longTouchNumberKey = true;
			var $target = $(evt.target);
			var test = _.bind(function() {
				return !this.longTouchNumberKey;
			}, this);

			var iteratee = _.bind(function(next) {

				if ($target.hasClass('backspace')) {
					this.removeLastKey();
				} else {
					var key = $target.attr('data-key');
					this.addKey(key);
				}

				_.delay(next, 75);

			}, this);

			async.until(test, iteratee);
		},

		onLongTouchEndNumberKey: function(evt) {

			this.longTouchNumberKey = false;
		},

		onClickNumberKey: function(evt) {

			var $target = $(evt.target);
			if ($target.hasClass('backspace')) {
				this.removeLastKey();
			} else if ($target.hasClass('decimal')) {
				this.addDecimal();
			} else {
				var key = $target.attr('data-key');
				this.addKey(key);
			}
		},

		removeLastKey: function() {

			var keys = this.getKeys();

			if (keys.length > 0) {
				// Remove the last character from the keys string.
				keys = keys.substr(0, keys.length - 1);
				this.model.set('keys', keys);
			}
		},

		addDecimal: function() {

			/*
				Don't add a decimal character if:
					* There is already a decimal in the keys string.
					* Or, the decimal character is disabled.
			*/
			if (!this.options.decimal) return;
			if (this.hasDecimal()) return;
			var keys = this.getKeys();
			keys += this.getDecimalSeparator();
			this.model.set('keys', keys);
		},

		addKey: function(key) {

			// Don't add an empty key.
			if (!key) return;

			var keys = this.getKeys();

			// Enforce a maximum length of the keys string to prevent overflow in the UI.
			if (keys.length >= app.config.numberPad.keysMaxLength) {
				return;
			}

			// Prevent excess leading zeroes.
			if (this.amount === '0' && value === '0') {
				return;
			}

			// Prevent excess digits after decimal.
			if (this.hasDecimal() && this.hasMaximumDigitsAfterDecimal()) {
				return;
			}

			// Append the key to the end of the keys string.
			keys += key;

			this.model.set('keys', keys);
		},

		getDecimalSeparator: function() {

			return this.numberFormatConfig.BigNumber.FORMAT.decimalSeparator;
		},

		hasMaximumDigitsAfterDecimal: function() {

			return this.countDigitsAfterDecimal() >= this.numberFormatConfig.decimals;
		},

		countDigitsAfterDecimal: function() {

			if (!this.hasDecimal()) return 0;
			var decimalSeparator = this.getDecimalSeparator();
			return this.getKeys().split(decimalSeparator)[1].length;
		},

		hasDecimal: function() {

			if (!this.options.decimal) return false;
			var decimalSeparator = this.getDecimalSeparator();
			return this.getKeys().indexOf(decimalSeparator) !== -1;
		},

		resetKeys: function() {

			this.model.set('keys', '');
		},

		getKeys: function() {

			return this.model.get('keys') || '';
		},

		onClose: function() {

			this.resetKeys();
		}

	});

})();
