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

			_.bindAll(this, 'listenForPayment', 'onResize');
			$(window).on('resize', this.onResize);
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

			QRCode.toDataURL(data, {
				errorCorrectionLevel: app.config.qrCodes.errorCorrectionLevel,
				margin: app.config.qrCodes.margin,
				width: Math.min(
					this.$address.width(),
					this.$address.height()
				),
			}, _.bind(function(error, dataUri) {

				if (error) {
					return app.mainView.showMessage(error);
				}

				var $img = $('<img/>', {
					class: 'address-qr-code-img',
					src: dataUri
				});

				this.$addressQrCode.empty().append($img);

			}, this));
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
				this.paymentRequest = paymentRequest;
				this.savePaymentInPaymentHistory({
					currency: paymentMethod.code,
					address: paymentRequest.address,
					confirmed: false,
					amount: paymentRequest.amount,
					displayCurrency: {
						code: displayCurrency,
						rate: displayCurrencyExchangeRate
					},
					data: paymentRequest.data || {},
				});
				this.renderQrCode(paymentRequest.uri);
				this.renderAddress(paymentRequest.address);
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

		savePaymentInPaymentHistory: function(data) {
			app.paymentRequests.add(data).save().then(_.bind(function(model) {
				this.paymentId = model.id;
			}, this));
		},

		updatePaymentHistory: function() {
			if (!this.paymentId) {
				app.mainView.showMessage(new Error(app.i18n.t('pay-address.missing-payment-id')));
			}
			var paymentTransaction = app.paymentRequests.get(this.paymentId);
			paymentTransaction.save({confirmed: true});
		},

		reRenderQrCode: function() {

			if (this.paymentRequest) {
				this.renderQrCode(this.paymentRequest.uri);
			}
		},

		onResize: function() {

			this.reRenderQrCode();
		},

		onClose: function() {

			this.stopListeningForPayment();
			$(window).off('resize', this.onResize);
		}

	});

})();
