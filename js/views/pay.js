var app = app || {};

app.views = app.views || {};

app.views.Pay = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'pay',

		template: '#template-pay-enter-amount',

		events: {
			'click .continue': 'continue',
		},

		initialize: function() {

			_.bindAll(this, 'updateAmountElement');

			this.numberPadView = new app.views.NumberPad({
				initialKeys: '0',
				decimal: true,
				numberFormat: this.model.get('currency'),
			});

			this.listenTo(this.numberPadView.model, 'change:keys', this.updateAmountElement);
		},

		serializeData: function() {

			var displayCurrency = app.settings.get('displayCurrency');

			return {
				amount: {
					display: {
						value: this.numberPadView.getKeys(),
						currency: displayCurrency,
					}
				},
				displayCurrency: displayCurrency,
				presets: app.config.presets[displayCurrency] || [],
			};
		},

		onRender: function() {

			this.$numberPad = this.$('.pay-number-pad');
			this.renderSubView(this.$numberPad, this.numberPadView);
			this.$amount = this.$('.amount-value');
			this.$continueButton = this.$('.button.continue');
			this.updateAmountElement();
		},

		updateAmountElement: function() {

			var amount = this.numberPadView.getKeys() || '0';
			var decimalSeparator = this.numberPadView.getDecimalSeparator();
			// Remove extra leading zeroes.
			amount = amount.replace(/^0{2,}/, '0');
			amount = amount.replace(new RegExp('^0([^' + decimalSeparator + '])'), '$1');
			this.$amount.text(amount);
			this.$continueButton.toggleClass('disabled', !this.isValidAmount());
		},

		setAmount: function(amount) {

			var decimalSeparator = this.numberPadView.getDecimalSeparator();
			var keys = amount.toString().replace(new RegExp(/,\./), decimalSeparator);
			this.numberPadView.setKeys(keys);
		},

		closeNumberPadView: function() {

			if (this.numberPadView) {
				this.numberPadView.close();
			}
			if (this.$numberPad) {
				this.$numberPad.empty();
			}
		},

		onClose: function() {

			this.closeNumberPadView();
		},

		continue: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			try {
				var amount = this.getAmount();
			} catch (error) {
				return app.mainView.showMessage(error);
			}

			this.model.set({ amount: amount });

			app.router.navigate('choose-payment-method', { trigger: true });
		},

		getAmount: function() {

			var keys = this.numberPadView.getKeys();
			var decimalSeparator = this.numberPadView.getDecimalSeparator();
			var amount = keys.replace(decimalSeparator, '.');

			try {
				amount = new BigNumber(amount);
			} catch (error) {
				throw new Error(app.i18n.t('pay-enter-amount.valid-number'));
			}

			if (!amount.isGreaterThan(0)) {
				throw new Error(app.i18n.t('pay-enter-amount.greater-than-zero'));
			}

			return amount.toString();
		},

		isValidAmount: function() {

			try {
				this.getAmount();
			} catch (error) {
				return false;
			}
			return true;
		},

		onBackButton: function() {

			app.exit();
		},

	});

})();
