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

			this.numberPadView.setElement(this.$('.number-pad')).render();
			this.$amount = this.$('.amount-value');
			this.updateAmountElement();
		},

		updateAmountElement: function() {

			var amount = this.numberPadView.getKeys() || '0';
			// Remove extra leading zeroes.
			amount = amount.replace(/^0{2,}/, '0');
			amount = amount.replace(new RegExp('^0([^' + this.options.decimal + '])'), '$1');
			this.$amount.text(amount);
		},

		continue: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			var keys = this.numberPadView.getKeys();
			var decimalSeparator = this.numberPadView.getDecimalSeparator();
			var amount = keys.replace(decimalSeparator, '.');

			try {
				amount = new BigNumber(amount);
			} catch (error) {
				return app.mainView.showMessage(app.i18n.t('pay-enter-amount.valid-number'));
			}

			if (!amount.isGreaterThan(0)) {
				return app.mainView.showMessage(app.i18n.t('pay-enter-amount.greater-than-zero'));
			}

			amount = amount.toString();

			this.model.set({ amount: amount });

			// Navigate to the next screen with the amount in the URI.
			app.router.navigate('choose-payment-method', { trigger: true });
		},

		onBackButton: function() {

			app.exit();
		},

	});

})();
