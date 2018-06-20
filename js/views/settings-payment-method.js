var app = app || {};

app.views = app.views || {};

app.views.SettingsPaymentMethod = (function() {

	'use strict';

	return app.views.utility.Form.extend({

		className: 'settings-payment-method',
		template: '#template-settings-payment-method',

		events: {
			'change :input[name]': 'onInputChange',
			'click .form-field-action': 'onClickAction',
		},

		initialize: function() {

			app.views.utility.Form.prototype.initialize.apply(this, arguments);
			this.paymentMethod = app.paymentMethods[this.options.key];
		},

		onRender: function() {
			if (_.isFunction(this.paymentMethod.onSettingsRender)) {
				this.paymentMethod.onSettingsRender();
			}
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
			if (!setting || !setting.onChange) return;
			setting.onChange.call(this.paymentMethod);
		},

		serializeData: function() {

			var key = this.options.key;
			var data = {
				key: key,
				label: _.result(this.paymentMethod, 'label'),
				description: _.result(this.paymentMethod, 'description'),
			};
			data.settings = _.map(this.paymentMethod.settings, function(setting) {
				return _.extend(
					{},
					setting,
					{
						id: ['settings', key, setting.name].join('-'),
						name: [key, setting.name].join('.'),
						value: app.settings.get(key + '.' + setting.name) || setting.default,
						visible: setting.visible !== false,
					}
				);
			});
			return data;
		},

		validate: function(data, done) {

			var paymentMethod = app.paymentMethods[this.options.key];
			app.settings.doValidation(paymentMethod.settings, data, done);
		},

		save: function(data) {

			app.settings.set(data);
		},

		onBackButton: function() {

			app.router.navigate('admin', { trigger: true });
		}

	});

})();
