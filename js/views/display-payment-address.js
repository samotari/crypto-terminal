var app = app || {};

app.views = app.views || {};

app.views.DisplayPaymentAddress = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'display-payment-address',

		template: '#template-pay-address',

		events: {
			'quicktouch .cancel': 'cancel',
			'quicktouch .back': 'back',
		},

		serializeData: function() {

			return {
				amount: {
					display: {
						value: this.options.amount,
						currency: app.settings.get('displayCurrency')
					},
					crypto: {
						currency: app.paymentMethods[this.options.method].code
					}
				}
			};
		},

		onRender: function() {

			this.$address = this.$('.address');
			this.$addressQrCode = this.$('.address-qr-code');
			this.$addressText = this.$('.address-text');
			this.$cryptoAmount = this.$('.crypto.amount');
			this.updateCryptoAmount();
		},

		updateCryptoAmount: function() {

			var displayCurrency = app.settings.get('displayCurrency');
			var paymentMethod = app.paymentMethods[this.options.method];
			var displayAmount = this.options.amount;

			if (displayCurrency === paymentMethod.code) {
				// Don't need to convert, because the payment method is the display currency.
				this.renderCryptoAmount(displayAmount);
				this.updateQrCode(displayAmount);
			} else {
				// Convert the display amount to the real amount in the desired cryptocurrency.
				paymentMethod.convertAmount(displayAmount, displayCurrency, _.bind(function(error, amount, displayCurrencyExchangeRate, displayCurrency) {

					if (error) {
						this.resetQrCode();
						return app.mainView.showMessage(error);
					}

					this.renderCryptoAmount(amount);
					this.updateQrCode(amount, displayCurrencyExchangeRate, displayCurrency);

				}, this));
			}
		},

		renderQrCode: function(data) {

			var width = Math.min(
				this.$address.width(),
				this.$address.height()
			);

			app.util.renderQrCode(this.$addressQrCode/* $target */, data, {
				width: width,
			}, function(error) {

				if (error) {
					return app.mainView.showMessage(error);
				}
			});
		},

		renderAddress: function(address) {

			this.$addressText.text(address);
		},

		renderCryptoAmount: function(amount) {

			var displayCurrency = app.settings.get('displayCurrency');
			var paymentMethod = app.paymentMethods[this.options.method];
			this.$cryptoAmount.find('.amount-value').text(amount);
			this.$cryptoAmount.toggleClass('visible', displayCurrency !== paymentMethod.code);
		},

		resetQrCode: function() {

			this.$addressQrCode.empty();
			this.$addressText.empty();
		},

		updateQrCode: function(amount, displayCurrencyExchangeRate, displayCurrency) {

			var paymentMethod = app.paymentMethods[this.options.method];

			paymentMethod.generatePaymentRequest(amount, _.bind(function(error, paymentRequest) {

				if (error) {
					this.resetQrCode();
					return app.mainView.showMessage(error);
				}

				this.renderQrCode(paymentRequest.uri);
				this.renderAddress(paymentRequest.address);
				this.paymentRequestUri = paymentRequest.uri;

				app.paymentRequests.add({
					currency: paymentMethod.code,
					address: paymentRequest.address,
					amount: paymentRequest.amount,
					displayCurrency: {
						code: displayCurrency,
						rate: displayCurrencyExchangeRate
					},
					data: paymentRequest.data || {},
					status: 'pending',
				}).save().then(_.bind(function(attributes) {
					this.paymentRequest = app.paymentRequests.get(attributes.id);
					this.startListeningForPayment();
				}, this));

			}, this));
		},

		startListeningForPayment: function() {

			if (!this.paymentRequest) return;

			var paymentMethod = app.paymentMethods[this.options.method];
			var paymentRequest = this.paymentRequest.toJSON();
			var received = false;
			var errorWhileWaiting;

			paymentMethod.listenForPayment(paymentRequest, function(error, wasReceived) {
				if (error) {
					errorWhileWaiting = error;
				} else {
					received = wasReceived === true;
				}
			});

			var done = _.bind(function(error) {

				this.stopListeningForPayment();

				if (error) {
					return app.mainView.showMessage(error);
				}

				if (received) {
					// Update the status of the payment request.
					this.paymentRequest.save({ status: 'unconfirmed' });
					// Show success screen.
					app.router.navigate('confirmed', { trigger: true });
				} else {
					app.mainView.showMessage(new Error(app.i18n.t('pay-address.timeout')));
				}

			}, this);

			async.until(function() { return received; }, function(next) {
				if (errorWhileWaiting) {
					return next(errorWhileWaiting);
				} else {
					_.delay(next, 100);
				}
			}, done);
		},

		stopListeningForPayment: function() {

			var paymentMethod = app.paymentMethods[this.options.method];
			paymentMethod.stopListeningForPayment();
		},

		cancel: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			// Navigate back to the amount screen.
			app.router.navigate('pay', { trigger: true });
		},

		back: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			var amount = this.options.amount.toString();

			// Navigate back to the payment method screen.
			app.router.navigate('pay/' + encodeURIComponent(amount), { trigger: true });
		},

		reRenderQrCode: function() {

			if (this.paymentRequestUri) {
				this.renderQrCode(this.paymentRequestUri);
			}
		},

		onResize: function() {

			this.reRenderQrCode();
		},

		onClose: function() {

			this.stopListeningForPayment();
		}

	});

})();
