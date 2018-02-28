var app = app || {};

app.views = app.views || {};
app.views.utility = app.views.utility || {};

app.views.utility.Form = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		// A template is required to display anything.
		template: null,

		events: {
			'change :input': 'process',
			'submit form': 'process',
		},

		initialize: function() {

			_.bindAll(this, 'process');
			this.process = _.throttle(this.process, 500, { leading: false });
		},

		validate: function(data) {
			// `data` is an object containing the form data.
			// Put your custom validation here.
			// Should return an array of errors. An empty array means no validation errors.
			return [];
		},

		onRender: function() {

			this.$error = this.$('.error');
		},

		showErrors: function(errors) {

			_.each(errors, function(error) {
				var $field = this.$(':input[name="' + error.field + '"]');
				var $row = $field.parents('.form-row').first();
				var $error = $row.find('.form-error');
				$field.addClass('error');
				$error.append($('<div/>', {
					class: 'form-error-message',
					text: error.message,
				}));
			}, this);
		},

		clearErrors: function() {

			this.$('.form-error-message').remove();
			this.$('.form-row.error').removeClass('error');
			this.$(':input.error').removeClass('error');
		},

		getFormData: function() {

			return this.$('form').serializeJSON();
		},

		process: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			this.clearErrors();
			var data = this.getFormData();
			var errors = this.validate(data);
			if (!_.isEmpty(errors)) {
				// Show the validation errors.
				this.showErrors(errors);
			} else {
				// No validation errors.
				try {
					// Try saving.
					this.save(data);
				} catch (error) {
					// Something went wrong during save.
					return this.showErrors(errors);
				}
			}
		},

		save: function(data) {
			// `data` is an object containing the form data.
			// Put your custom save methods here.
		}

	});

})();
