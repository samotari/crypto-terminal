var app = app || {};

app.views = app.views || {};

app.views.DisplayPaymentAddress = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'display-payment-address',

		template: '#template-pay-address',

		events: {
			'click .cancel': 'cancel',
			'click .back': 'back'
		},

		paymentId: '',

		initialize: function() {

			_.bindAll(this, 'listenForPayment');
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

			var qr = qrcode(4, 'L');
			qr.addData(data);
			qr.make();
			var img = qr.createImgTag(app.config.qrCodes.cellSize, app.config.qrCodes.margin);
			this.$addressQrCode.html($(img).addClass('address-qr-code-img'));
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
			var savePaymentInPaymentHistory = _.bind(this.savePaymentInPaymentHistory, this);

			paymentMethod.generatePaymentRequest(amount, _.bind(function(error, paymentRequest, address) {
				if (error) {
					this.resetQrCode();
					return app.mainView.showMessage(error);
				}
				var amountFromPaymentRequest = paymentRequest.split('=')[1];
				savePaymentInPaymentHistory(paymentMethod.code, address, false, amountFromPaymentRequest, displayCurrencyExchangeRate, displayCurrency);
				this.renderQrCode(paymentRequest);
				this.renderAddress(address);
				this.startListeningForPayment(paymentRequest);

			}, this));
		},

		startListeningForPayment: function(paymentRequest) {

			this._listenForPaymentTimeout = _.delay(
				this.listenForPayment,
				app.config.displayPaymentAddress.listener.delays.first,
				paymentRequest
			);
		},

		stopListeningForPayment: function() {

			if (this._listenForPaymentTimeout) {
				clearTimeout(this._listenForPaymentTimeout);
			}
		},

		listenForPayment: function(paymentRequest) {

			var received;
			var startTime = (new Date).getTime();
			var timeout = app.config.displayPaymentAddress.listener.timeout;
			var waitBetween = app.config.displayPaymentAddress.listener.delays.between;
			var paymentMethod = app.paymentMethods[this.options.method];
			var updatePaymentHistory = _.bind(this.updatePaymentHistory, this);

			var iteratee = _.bind(function(next) {

				paymentMethod.checkPaymentReceived(paymentRequest, _.bind(function(error, wasReceived) {

					if (error) {
						return next(error);
					}

					if (wasReceived) {
						received = true;
						updatePaymentHistory();
						return next();
					}

					// Wait before checking again.
					this._listenForPaymentTimeout = _.delay(next, waitBetween);

				}, this));

			}, this);

			var onDone = _.bind(function(error) {

				if (error) {
					return app.mainView.showMessage(error);
				}

				if (received) {
					// Show success screen.
					app.router.navigate('confirmed', { trigger: true });
				} else {
					app.mainView.showMessage(new Error(app.i18n.t('pay-address.timeout')));
				}

			}, this);

			async.until(function() {
				// If the following returns TRUE, the loop will stop.
				return received || ((new Date).getTime() - startTime) >= timeout;
			}, iteratee, onDone);
		},

		cancel: function() {

			// Navigate back to the amount screen.
			app.router.navigate('pay', { trigger: true });
		},

		back: function() {
			var amount = this.options.amount.toString();

			// Navigate back to the payment method screen.
			app.router.navigate('pay/' + encodeURIComponent(amount), { trigger: true });
		},

		savePaymentInPaymentHistory : function(currency, address, confirmed, amountReceived, displayCurrencyExchangeRate, displayCurrency) {
			var paymentTransaction = new app.models.PaymentRequest({
				currency: currency,
				address: address,
				confirmed: confirmed,
				amount: amountReceived,
				displayCurrency: {
					code: displayCurrency,
					rate: displayCurrencyExchangeRate
				}
			})
			app.paymentRequests.add(paymentTransaction);
			paymentTransaction.save().then(_.bind(function() {
				this.paymentId = paymentTransaction.id;
			}, this));
		},

		updatePaymentHistory: function() {
			if (!this.paymentId) {
				app.mainView.showMessage(new Error(app.i18n.t('pay-address.missing-payment-id')));
			}
			var paymentTransaction = app.paymentRequests.get(this.paymentId);
			paymentTransaction.save({confirmed: true});
		},

		onClose: function() {

			this.stopListeningForPayment();
		}

	});

})();
