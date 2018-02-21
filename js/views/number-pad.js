var app = app || {};

app.views = app.views || {};

app.views.NumberPad = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'number-pad',

		template: '#template-number-pad',

		events: {
			'mousedown .number-pad-key': 'onKeyMouseDown',
			'touchstart .number-pad-key': 'onKeyTouchStart',
			'touchend .number-pad-key': 'onKeyTouchEnd',
		},

		initialize: function() {

			_.bindAll(this, 'onLongTouch');

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

		onKeyTouchStart: function(evt) {

			evt.preventDefault();
			var $target = $(evt.target);
			// Give the target key the "pressed" class name temporarily.
			// This gives the user some visual feedback.
			$target.addClass('pressed');
			// When the user presses and holds a key.
			// Wait a moment and then start executing the key press repeatedly.
			this.longKeyTouch = false;
			this.longKeyTouchTimeout = setTimeout(this.onLongTouch, 500);
		},

		onLongTouch: function() {

			var $target = this.$('.number-pad-key.pressed');

			this.longKeyTouch = true;

			var test = _.bind(function() {
				return !this.longKeyTouch;
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

		onKeyTouchEnd: function(evt) {

			evt.preventDefault();
			var $target = $(evt.target);
			$target.removeClass('pressed');

			if (!this.longKeyTouch) {
				if ($target.hasClass('backspace')) {
					this.removeLastKey();
				} else {
					var key = $target.attr('data-key');
					this.addKey(key);
				}
			}

			this.longKeyTouch = false;
			clearTimeout(this.longKeyTouchTimeout);
		},

		onKeyMouseDown: function(evt) {

			evt.preventDefault();
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
