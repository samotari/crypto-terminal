var app = app || {};

app.views = app.views || {};

app.views.GettingStartedPaymentMethodSettings = (function() {

	'use strict';

	return app.views.utility.Form.extend({

		className: 'getting-started getting-started-payment-method-settings',
		template: '#template-getting-started-payment-method-settings',

		events: {
			'change :input[name]': 'onInputChange',
			'click .form-field-action': 'onClickAction',
		},

		verificationView: null,

		initialize: function() {

			app.views.utility.Form.prototype.initialize.apply(this, arguments);
			this.paymentMethod = app.paymentMethods[this.options.key];
		},

		serializeData: function() {

			var key = this.options.key;
			var data = {
				title: _.result(this.paymentMethod, 'label'),
				instructions: _.result(this.paymentMethod, 'instructions'),
				links: _.result(this.paymentMethod, 'links'),
			};
			data.settings = app.views.AdminPaymentMethodSettings.prototype.preparePaymentMethodSettings(this.paymentMethod.settings, key);
			return data;
		},

		onClickAction: function(evt) {

			var $target = $(evt.target);
			var setting = _.findWhere(this.paymentMethod.settings, {
				name: $target.attr('data-setting').split('.').slice(1).join('.')
			});
			if (!setting) return;
			var settingReference = $target.attr('data-setting');
			var action = _.findWhere(setting.actions || [], { name: $target.attr('data-action') });
			if (!action || !action.fn) return;
			var formData = this.getFormData();
			var value = formData[settingReference];
			var $input = this.$(':input[name="' + settingReference + '"]');
			action.fn(value, function(error, newValue) {
				if (error) {
					return app.mainView.showMessage(error);
				}
				$input.val(newValue).trigger('change');
			});
		},

		onInputChange: function(evt) {

			var $target = $(evt.target);
			var name = $target.attr('name');
			if (!name) return;

			var setting = _.findWhere(this.paymentMethod.settings, {
				name: name.split('.').slice(1).join('.')
			});

			if (setting && _.isFunction(setting.onChange)) {
				setting.onChange.call(this.paymentMethod);
			}
		},

		validate: function(data, done) {

			app.settings.doValidation(this.paymentMethod.settings, data, done);
		},

		save: function(data) {

			app.settings.set(data);
		},

		isComplete: function() {
			var paymentMethod = app.paymentMethods[this.options.key];
			return paymentMethod.isConfigured();
		},

	});

})();
