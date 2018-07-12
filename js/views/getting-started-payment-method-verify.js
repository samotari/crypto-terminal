var app = app || {};

app.views = app.views || {};

app.views.GettingStartedPaymentMethodVerify = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'getting-started getting-started-payment-method-verify',
		template: '#template-getting-started-payment-method-verify',

		verificationView: null,

		initialize: function() {

			_.bindAll(this, 'renderVerificationView');
			this.renderVerificationView = _.throttle(this.renderVerificationView, 100, { leading: false });
			this.paymentMethod = app.paymentMethods[this.options.key];
			_.each(this.paymentMethod.settings, function(setting) {
				this.listenTo(app.settings, 'change:' + setting.path, this.renderVerificationView);
			}, this);
		},

		serializeData: function() {

			return {
				title: _.result(this.paymentMethod, 'label'),
				instructions: _.result(this.paymentMethod, 'verificationInstructions'),
			};
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

		onClose: function() {

			this.closeVerificationView();
		},

	});

})();
