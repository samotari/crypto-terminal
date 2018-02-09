var app = app || {};

app.views = app.views || {};
app.views.utility = app.views.utility || {};

app.views.utility.Form = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		// A template is required to display anything.
		template: null,

		events: {
			'submit form': 'onSubmit'
		},

		validate: function(data) {
			// `data` is an object containing the form data.
			// Put your custom validation here.
			// Should return an array of errors. An empty array means no validation errors.
			return [];
		},

		onRender: function() {

			this.$error = this.$('.error');
			this.$success = this.$('.success');
		},

		showSuccess: function(message) {

			if (this.$success) {
				this.$success.text(message);
			}
			_.delay(_.bind(this.clearSuccess, this), 5000);
		},

		clearSuccess: function() {

			if (this.$success) {
				this.$success.empty();
			}
		},

		showErrors: function(errors) {

			var errorText = errors.join('\n');
			if (this.$error) {
				this.$error.text(errorText);
			}
		},

		clearErrors: function() {

			if (this.$error) {
				this.$error.empty();
			}
		},

		onSubmit: function(evt) {

			evt.preventDefault();
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
				// Saved successfully.
				this.showSuccess(app.i18n.t('form.save-success'));
			}
		},

		getFormData: function() {

			return this.$('form').serializeJSON();
		},

		save: function(data) {
			// `data` is an object containing the form data.
			// Put your custom save methods here.
		}

	});

})();
