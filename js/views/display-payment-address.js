var app = app || {};

app.views = app.views || {};

app.views.DisplayPaymentAddress = (function() {

	'use strict';

	return Backbone.View.extend({

		className: 'display-payment-address',

		template: '#template-pay-address',

		events: {
			'click .cancel': 'cancel'
		},

		initialize: function(options) {

			this.options = options || {};
		},

		render: function() {

			var html = $(this.template).html();
			var template = Handlebars.compile(html);
			var data = {
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

			data.displayCurrencies = _.map(app.config.supportedDisplayCurrencies, function(code) {
				return {
					code: code,
					selected: code === app.settings.get('displayCurrency')
				};
			});

			this.$el.html(template(data));
			this.onRender();
			return this;
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
				paymentMethod.convertAmount(displayAmount, displayCurrency, _.bind(function(error, amount) {

					if (error) {
						this.resetQrCode();
						return app.mainView.showMessage(error);
					}

					this.renderCryptoAmount(amount);
					this.updateQrCode(amount);

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

		updateQrCode: function(amount) {

			var paymentMethod = app.paymentMethods[this.options.method];

			paymentMethod.generatePaymentRequest(amount, _.bind(function(error, paymentRequest, address) {

				if (error) {
					this.resetQrCode();
					return app.mainView.showMessage(error);
				}

				this.renderQrCode(paymentRequest);
				this.renderAddress(address);
				this.listenForPayment(paymentRequest);

			}, this));
		},

		listenForPayment: function(paymentRequest) {

			var paymentMethod = app.paymentMethods[this.options.method];
			var received;

			// Delay times in milliseconds:
			var delays = {
				// Wait time before the first check:
				first: 10000,
				// Wait time between checks:
				between: 5000,
				// When to stop performing checks:
				timeout: 180000
			};

			setTimeout(function() {
				var startTime = (new Date).getTime();
				async.until(function() {
					// If the following returns RETURN, the loop will stop.
					return received || ((new Date).getTime() - startTime) >= delays.timeout;
				}, function(next) {
					paymentMethod.checkPaymentReceived(paymentRequest, function(error, wasReceived) {
						if (error) return next(error);
						if (wasReceived) {
							received = true;
							return next();
						}
						// Wait before checking again.
						setTimeout(next, delays.between);
					});
				}, function(error) {

					if (error) {
						app.mainView.showMessage(error);
					}

					if (received) {
						// Show success screen.
						app.router.navigate('confirmed', { trigger: true });
					} else {
						app.mainView.showMessage(new Error('Timed out while waiting for payment'));
					}

				});
			}, delays.first);
		},

		cancel: function() {

			// Navigate back to the amount screen.
			app.router.navigate('pay', { trigger: true });
		}

	});

})();
