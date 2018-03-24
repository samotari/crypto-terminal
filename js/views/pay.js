var app = app || {};

app.views = app.views || {};

app.views.Pay = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'pay',

		template: '#template-pay-enter-amount',

		events: {
			'quicktouch .continue': 'continue',
		},

		initialize: function() {

			_.bindAll(this, 'updateAmountElement');

			this.numberPadView = new app.views.NumberPad({
				initialKeys: '0',
				dot: true,
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
			amount = amount.replace(/^0{2,}/, '0').replace(/^0([^\\.])/, '$1');
			amount = app.util.formatNumber(amount);
			this.$amount.text(amount);
		},

		continue: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			var amount;

			try {
				amount = new BigNumber(this.numberPadView.getKeys());
			} catch (error) {
				return app.mainView.showMessage(app.i18n.t('pay-enter-amount.valid-number'));
			}

			if (!amount.isGreaterThan(0)) {
				return app.mainView.showMessage(app.i18n.t('pay-enter-amount.greater-than-zero'));
			}

			// Navigate to the next screen with the amount in the URI.
			app.router.navigate('pay/' + encodeURIComponent(amount.toString()), { trigger: true });
		},

		onBackButton: function() {

			navigator.app.exitApp();
		}

	});

})();
