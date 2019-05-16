var app = app || {};

app.views = app.views || {};

app.views.AdminPaymentMethodSettings = (function() {

	'use strict';

	return app.views.utility.Form.extend({

		className: 'admin-payment-method-settings',
		template: '#template-admin-payment-method-settings',
		verificationView: null,

		inputs: function() {

			return this.paymentMethod.inputs;
		},

		initialize: function() {

			_.bindAll(this, 'renderVerificationView');
			this.renderVerificationView = _.throttle(this.renderVerificationView, 100, { leading: false });
			this.paymentMethod = app.paymentMethods[this.options.key];
			app.views.utility.Form.prototype.initialize.apply(this, arguments);
			this.listenTo(app.settings, 'change', this.renderVerificationView);
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

		serializeData: function() {

			var data = app.views.utility.Form.prototype.serializeData.apply(this, arguments);
			data.key = this.options.key;
			data.label = _.result(this.paymentMethod, 'label');
			data.instructions = _.result(this.paymentMethod, 'instructions');
			data.links = _.result(this.paymentMethod, 'links');
			return data;
		},

		onBackButton: function() {

			app.router.navigate('admin', { trigger: true });
		},

		onClose: function() {

			this.closeVerificationView();
		},

	});

})();
