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

		validate: function(data, done) {
			// `data` is an object containing the form data.
			// Put your custom validation here.
			// Execute the callback with an array of errors to indicate failure.
			/*
				done([
					{
						field: 'fieldname',
						message: new Error('Not valid!'),
					}
				]);
			*/
			// Execute the callback with no arguments to indicate success.
			done();
		},

		showErrors: function(validationErrors) {

			if (!_.isEmpty(validationErrors)) {
				_.each(validationErrors, function(validationError) {
					var $field = this.$(':input[name="' + validationError.field + '"]');
					var $row = $field.parents('.form-row').first();
					var $error = $row.find('.form-error');
					$field.addClass('error');
					$error.append($('<div/>', {
						class: 'form-error-message',
						text: validationError.error,
					}));
				}, this);
			}
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

			this.validate(data, _.bind(function(error, validationErrors) {

				if (error) {
					app.error(error);
					return app.mainView.showMessage(error);
				}

				if (!_.isEmpty(validationErrors)) {
					this.showErrors(validationErrors);
				} else {
					// No validation errors.
					try {
						// Try saving.
						this.save(data);
					} catch (error) {
						app.error(error);
						return app.mainView.showMessage(error);
					}
				}

			}, this));
		},

		save: function(data) {
			// `data` is an object containing the form data.
			// Put your custom save methods here.
		}

	});

})();
