var app = app || {};

app.views = app.views || {};

app.views.EnterPin = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'enter-pin',

		template: '#template-enter-pin',

		events: {
			'click .cancel': 'onCancel',
			'click .submit': 'onSubmit',
		},

		initialize: function() {

			_.bindAll(this, 'updateKeysDisplay', 'onDocumentClick');
			this.numberPadView = new app.views.NumberPad({ decimal: false });
			this.listenTo(this.numberPadView.model, 'change:keys', this.updateKeysDisplay);
			this.render().$el.appendTo($('body'));
			_.defer(_.bind(function() {
				// Defer the document event listener so that the view isn't closed immediately.
				$(document).on('click', this.onDocumentClick);
			}, this));
		},

		serializeData: function() {

			return {
				title: this.options.title,
				instructions: this.options.instructions,
				showCancel: this.options.showCancel !== false,
			};
		},

		onRender: function() {

			this.$keys = this.$('.enter-pin-keys');
			this.numberPadView.setElement(this.$('.number-pad')).render();
			this.updateKeysDisplay();
		},

		onSubmit: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			this.trigger('pin', this.numberPadView.getKeys());
		},

		onCancel: function(evt) {

			this.trigger('cancel');
			this.close();
		},

		updateKeysDisplay: function() {

			var numberOfKeys = this.numberPadView.getKeys().length;
			var displayedKeys = '';
			while (displayedKeys.length < numberOfKeys) {
				displayedKeys += '•';
			}
			this.$keys.text(displayedKeys);
		},

		onDocumentClick: function(evt) {

			if (this.options.closable) {

				var $target = $(evt.target);

				if (
					$target[0] !== this.$el[0] &&
					!$.contains(this.$el[0], $target[0])
				) {
					this.close();
				}
			}
		},

		onClose: function() {

			this.numberPadView.close();
			$(document).off('click', this.onDocumentClick);
		}

	});

})();
