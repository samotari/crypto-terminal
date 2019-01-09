var app = app || {};

app.views = app.views || {};

app.views.DisplayPaymentAddress = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'display-payment-address',

		template: '#template-pay-address',

		events: {
			'click .cancel': 'cancel',
			'click .back': 'back',
		},

		timers: {
			listener: null,
			savePaymentRequest: null,
		},

		ctApiListeners: {},
		payingFromPaperWallet: false,

		initialize: function() {

			_.bindAll(this,
				'fullScreenQRCodeOff',
				'fullScreenQRCodeOn',
				'generatePaymentRequest',
				'onDocumentClick',
				'payFromPaperWallet',
				'queryRate',
				'renderCryptoAmount',
				'renderQrCode',
				'scanAndPayFromPaperWallet',
				'startListeningForPayment'
			);
			var method = this.model.get('method');
			this.paymentMethod = app.paymentMethods[method];
			this.listenTo(this.model, 'change:amount change:rate', this.generatePaymentRequest);
			this.listenTo(this.model, 'change:amount change:rate', this.renderCryptoAmount);
			this.listenTo(this.model, 'change:uri', this.renderQrCode);
			this.listenTo(this.model, 'change:uri', this.startListeningForPayment);
			this.$scanAndPayFromPaperWallet = app.mainView.$('.header-button.qrcode');
			this.$scanAndPayFromPaperWallet.on('click', this.scanAndPayFromPaperWallet);
			if (this.canPayFromPaperWallet()) {
				this.nfcStartReading = app.nfc.startReading(app.log);
				app.nfc.on('read', this.payFromPaperWallet);
			}
		},

		queryRate: function() {

			var currency = this.model.get('currency');

			if (this.paymentMethod.code !== currency) {
				app.busy();
				this.paymentMethod.getExchangeRate(currency, _.bind(function(error, rate) {
					app.busy(false);
					if (error) {
						return app.mainView.showMessage(error);
					}
					this.model.set({ rate: rate });
				}, this));
			} else {
				this.model.set({ rate: '1' });
			}
		},

		serializeData: function() {

			if (!this.model || !this.paymentMethod) return {};

			return {
				amount: {
					display: {
						value: this.model.get('amount'),
						currency: this.model.get('currency'),
					},
					crypto: {
						ref: this.paymentMethod.ref,
						currency: this.paymentMethod.code,
					},
				}
			};
		},

		onRender: function() {

			this.$address = this.$('.address');
			this.$addressQrCode = $('<div/>', {
				class: 'address-qr-code',
			}).appendTo($('body'));
			this.$addressQrCodeCover = $('<div/>', {
				class: 'address-qr-code-cover',
			}).appendTo($('body'));
			this.$cryptoAmount = this.$('.crypto.amount');
			this.toggleQrCodeHeaderIconVisibility();
			this.renderCryptoAmount();
			this.renderQrCode();
			this.startListeningForStatus();
			this.startListeningForPayment();
			_.defer(this.queryRate);

			// When payment is rejected the model already has rate.
			var rate = this.model.get('rate');
			if (rate) {
				_.defer(this.onChangeRate);
			}
			this.$addressQrCode.on('click', this.fullScreenQRCodeOn);
			$(document).on('click', this.onDocumentClick);
		},

		generatePaymentRequest: function() {

			var rate = this.model.get('rate');
			if (!rate) return;
			var cryptoAmount = this.model.getCryptoAmount();

			this.paymentMethod.generatePaymentRequest(cryptoAmount, _.bind(function(error, paymentRequest) {

				if (error) {
					return app.mainView.showMessage(error);
				}

				this.model.set({
					data: paymentRequest.data,
					uri: paymentRequest.uri,
					status: 'pending',
				});

				this.timers.savePaymentRequest = _.delay(_.bind(function() {
					this.model.save();
				}, this), app.config.paymentRequests.saveDelay);

			}, this));
		},

		renderCryptoAmount: function() {

			var rate = this.model.get('rate');
			if (!rate) return;
			var amount = this.model.get('amount');
			var currency = this.model.get('currency');
			var paymentMethod = this.paymentMethod;
			var isDisplayCurrency = paymentMethod.code === currency;

			if (isDisplayCurrency || !amount || !rate) {
				this.$cryptoAmount.find('.amount-value').text('');
				this.$cryptoAmount.removeClass('visible');
			} else {
				var cryptoAmount = this.model.getCryptoAmount();
				var formattedAmount = app.util.formatNumber(cryptoAmount, paymentMethod.code);
				this.$cryptoAmount.find('.amount-value').text(formattedAmount);
				this.$cryptoAmount.addClass('visible');
			}
		},

		renderQrCode: function() {

			var data = this.model.get('uri');
			if (!data) return;

			var fullScreenSize = this.getQrCodeFullScreenSize();

			app.busy();

			app.util.renderQrCode(this.$addressQrCode/* $target */, data, {
				width: fullScreenSize,
				margin: 1,
			}, _.bind(function(error) {

				app.busy(false);

				if (error) {
					return app.mainView.showMessage(error);
				}

				this.fullScreenQRCodeOff();

			}, this));
		},

		savePaymentData: function(paymentData) {

			var data = _.extend({}, this.model.get('data') || {}, paymentData);
			this.model.set('data', data).save();
		},

		startListeningForPayment: function() {

			this.stopListeningForPayment();

			if (!this.model.get('uri')) return;

			var paymentRequest = this.model.toJSON();

			this.paymentMethod.listenForPayment(paymentRequest, _.bind(function(error, paymentData) {

				if (error) {
					return app.mainView.showMessage(error);
				}

				this.savePaymentData(paymentData);

				var isReplaceable = paymentData && paymentData.isReplaceable || false;

				if (isReplaceable) {
					// Special case for RBF feature in bitcoin and litecoin.
					// Show a warning dialogue where user can accept or reject the payment.
					app.router.navigate('payment-replaceable', { trigger: true });
				} else {
					app.router.navigate('payment-status/unconfirmed', { trigger: true });
				}

			}, this));

			this.startPaymentRequestTimeoutTimer();
			this.toggleQrCodeHeaderIconVisibility();
		},

		stopListeningForPayment: function() {

			if (this.paymentMethod) {
				this.paymentMethod.stopListeningForPayment();
			}
		},

		startPaymentRequestTimeoutTimer: function() {

			var startTime = Date.now();
			var checkElapsedTime = _.bind(function() {
				clearTimeout(this.timers.paymentRequestTimeout);
				var elapsedTime = Date.now() - startTime;
				var timedOut = elapsedTime > app.config.paymentRequests.timeout;
				if (!timedOut) {
					this.timers.paymentRequestTimeout = _.delay(checkElapsedTime, 20);
				} else {
					app.router.navigate('payment-status/timed-out', { trigger: true });
				}
			}, this);
			checkElapsedTime();
		},

		startListeningForStatus: function() {

			var method = this.model.get('method');
			var channel = 'status-check?' + querystring.stringify({
				network: method,
			});
			var listener = function(status) {
				var isActive = status[method] || false;
				$('.view.display-payment-address').toggleClass('payment-method-inactive', !isActive);
			};
			this.ctApiListeners.status = {
				channel: channel,
				listener: listener,
			};
			app.services.ctApi.subscribe(channel, listener);
		},

		payFromPaperWallet: function(walletData) {

			// Only pay from paper wallet one at a time.
			if (this.payingFromPaperWallet) return;
			this.payingFromPaperWallet = true;
			app.busy(true);

			var done = _.bind(function(error, paymentData) {

				this.payingFromPaperWallet = false;
				app.busy(false);

				if (error) {
					return app.mainView.showMessage(error);
				}

				// Payment successful.
				this.savePaymentData(paymentData);

			}, this);

			var paymentRequest = this.model.toJSON();
			this.paymentMethod.payRequestFromPaperWallet(paymentRequest, walletData, done);
		},

		scanAndPayFromPaperWallet: function() {

			var payFromPaperWallet = _.bind(this.payFromPaperWallet, this);

			app.device.scanQRCodeWithCamera(function(error, data) {

				if (error) {
					return app.mainView.showMessage(error);
				}

				if (data) {
					payFromPaperWallet(data);
				}
			});
		},

		toggleQrCodeHeaderIconVisibility: function(visible) {

			if (_.isUndefined(visible)) {
				visible = this.canPayFromPaperWallet();
			}

			this.$scanAndPayFromPaperWallet.toggleClass('visible', visible);
		},

		getQrCodeFullScreenSize: function() {

			return Math.min(
				$('body').width() - 20,
				$('body').height() - 20
			);
		},

		fullScreenQRCodeOn: function() {

			_.defer(_.bind(function() {
				if ($('html').hasClass('full-screen-qr-code')) return;
				$('html').addClass('full-screen-qr-code');
				var fullScreenSize = this.getQrCodeFullScreenSize();
				this.$addressQrCode.css({
					left: ($('body').width() - fullScreenSize) / 2,
					top: ($('body').height() - fullScreenSize) / 2,
					width: fullScreenSize,
					height: fullScreenSize,
					'background-size': fullScreenSize + 'px',
				});
			}, this));
		},

		fullScreenQRCodeOff: function() {

			_.defer(_.bind(function() {
				$('html').removeClass('full-screen-qr-code');
				var width = Math.min(
					this.$address.width(),
					this.$address.height()
				);
				var position = {
					top: this.$('.info').outerHeight() + this.$('.info').offset().top,
					left: ($('body').width() - width) / 2,
				};
				this.$addressQrCode.css({
					left: position.left,
					top: position.top,
					width: width,
					height: width,
					'background-size': width + 'px',
				});
			}, this));
		},

		canPayFromPaperWallet: function() {

			var payRequestFromPaperWallet = this.paymentMethod.payRequestFromPaperWallet;
			return !!payRequestFromPaperWallet && _.isFunction(payRequestFromPaperWallet);
		},

		cancel: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			app.cleanUpPendingPaymentRequest();

			// Navigate back to the enter amount screen.
			app.router.navigate('pay', { trigger: true });
		},

		back: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			this.stopListening();

			// Navigate back to the choose payment method screen.
			app.router.navigate('choose-payment-method', { trigger: true });
		},

		stopTimers: function() {

			_.each(this.timers, function(timer) {
				clearTimeout(timer);
			});
		},

		unsubscribeAllCtApiListeners: function() {

			_.chain(this.ctApiListeners).compact().each(function(listener) {
				app.services.ctApi.unsubscribe(listener.channel, listener.listener);
			});
			this.ctApiListeners = {};
		},

		onResize: function() {

			this.renderQrCode();
		},

		onClose: function() {

			this.stopTimers();
			app.nfc.stopReading();
			app.nfc.off('read', this.payFromPaperWallet);
			this.unsubscribeAllCtApiListeners();

			if (this.nfcStartReading && this.nfcStartReading.cancel) {
				this.nfcStartReading.cancel();
			}

			this.toggleQrCodeHeaderIconVisibility(false);
			this.$scanAndPayFromPaperWallet.off('click', this.scanAndPayFromPaperWallet);
			this.fullScreenQRCodeOff();
			$(document).off('click', this.onDocumentClick);
			if (this.$addressQrCode) {
				this.$addressQrCode.remove();
			}
			if (this.$addressQrCodeCover) {
				this.$addressQrCodeCover.remove();
			}
		},

		onDocumentClick: function() {

			if ($('html').hasClass('full-screen-qr-code')) {
				this.fullScreenQRCodeOff();
			}
		},

		onBackButton: function() {

			this.back();
		},

	});

})();
