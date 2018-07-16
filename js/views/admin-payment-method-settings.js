var app = app || {};

app.views = app.views || {};

app.views.AdminPaymentMethodSettings = (function() {

	'use strict';

	return app.views.utility.Form.extend({

		className: 'admin-payment-method-settings',
		template: '#template-admin-payment-method-settings',

		events: {
			'change :input[name]': 'onInputChange',
			'click .form-field-action': 'onClickAction',
		},

		verificationView: null,

		initialize: function() {

			app.views.utility.Form.prototype.initialize.apply(this, arguments);
			_.bindAll(this, 'renderVerificationView');
			this.renderVerificationView = _.throttle(this.renderVerificationView, 100, { leading: false });
			this.paymentMethod = app.paymentMethods[this.options.key];
		},

		onRender: function() {

			this.$verification = this.$('.verification');
			this.renderVerificationView();
		},

		renderVerificationView: function() {

			if (!_.isFunction(this.paymentMethod.createVerificationView)) return;

			this.closeVerificationView();

			this.paymentMethod.createVerificationView(_.bind(function(error, view) {

				if (error) {
					app.log('Failed to create verification view', error);
					return;
				}

				this.verificationView = view;
				this.$verification.append(view.el);
				view.render();

			}, this));
		},

		closeVerificationView: function() {

			if (this.verificationView) {
				this.verificationView.close();
				this.verificationView = null;
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

			this.renderVerificationView();

			if (setting && _.isFunction(setting.onChange)) {
				setting.onChange.call(this.paymentMethod);
			}
		},

		serializeData: function() {

			var key = this.options.key;
			var data = {
				key: key,
				label: _.result(this.paymentMethod, 'label'),
				instructions: _.result(this.paymentMethod, 'instructions'),
				links: _.result(this.paymentMethod, 'links'),
			};
			data.settings = this.preparePaymentMethodSettings(this.paymentMethod.settings, key);
			return data;
		},

		validate: function(data, done) {

			app.settings.doValidation(this.paymentMethod.settings, data, done);
		},

		save: function(data) {

			app.settings.set(data);
		},

		onBackButton: function() {

			app.router.navigate('admin', { trigger: true });
		},

		onClose: function() {

			this.closeVerificationView();
		},

		preparePaymentMethodSettings: function(paymentMethodSettings, key) {
			return _.map(paymentMethodSettings, function(setting) {
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
		}

	});

})();
