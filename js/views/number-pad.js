var app = app || {};

app.views = app.views || {};

app.views.NumberPad = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'number-pad',

		template: '#template-number-pad',

		events: {
			'quicktouch .number-pad-key': 'onQuickTouchNumberKey',
			'longtouch .number-pad-key': 'onLongTouchNumberKey',
			'touchend .number-pad-key': 'onTouchEndNumberKey',
		},

		initialize: function() {

			this.options = _.defaults(this.options || {}, {
				initialKeys: '',
				dot: true,
			});

			// Use a model to store the state.
			this.model = new Backbone.Model();

			// Set the keys string with an initial value.
			this.model.set('keys', this.options.initialKeys);

			if (!this.options.dot) {
				this.$el.addClass('no-dot');
			}
		},

		serializeData: function() {

			return {
				dot: this.options.dot,
			};
		},

		onTouchEndNumberKey: function(evt) {

			this.longTouchNumberKey = false;
		},

		onLongTouchNumberKey: function(evt) {

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

		onQuickTouchNumberKey: function(evt) {

			var $target = $(evt.target);
			if ($target.hasClass('backspace')) {
				this.removeLastKey();
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

		addKey: function(key) {

			// Don't add an empty key.
			if (!key) return;

			var keys = this.getKeys();

			// Enforce a maximum length of the keys string to prevent overflow in the UI.
			if (keys.length >= app.config.numberPad.keysMaxLength) {
				return;
			}

			/*
				Don't add a dot character if:
					* There is already a dot in the keys string.
					* Or, the dot character is disabled.
			*/
			if (key === '.' && (this.hasDot() || !this.options.dot)) {
				return;
			}

			// Prevent excess leading zeroes.
			if (this.amount === '0' && value === '0') {
				return;
			}

			// Append the key to the end of the keys string.
			keys += key;

			this.model.set('keys', keys);
		},

		resetKeys: function() {

			this.model.set('keys', '');
		},

		getKeys: function() {

			return this.model.get('keys') || '';
		},

		hasDot: function() {

			return this.getKeys().indexOf('.') !== -1;
		},

		onClose: function() {

			this.resetKeys();
		}

	});

})();
