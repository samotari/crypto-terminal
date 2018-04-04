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

		timerForTimeOut: null,
		listenerTimeOut: null,
		savePaymentRequestTimeout: null,

		initialize: function() {

			_.bindAll(this, 'queryRate', 'onChangeRate');
			var method = this.model.get('method');
			this.paymentMethod = app.paymentMethods[method];
			this.listenTo(this.model, 'change:rate', this.onChangeRate);
		},

		queryRate: function() {

			var currency = this.model.get('currency');
			var rate = this.model.get('rate');

			if (!_.isNull(rate)) {
				this.onChangeRate();
			} else {
				if (this.paymentMethod.code !== currency) {
					app.busy();
					this.paymentMethod.getExchangeRate(currency, _.bind(function(error, rate) {
						if (error) {
							app.busy(false);
							return app.mainView.showMessage(error);
						}
						this.model.set({ rate: rate });
					}, this));
				} else {
					this.model.set({ rate: '1' });
				}
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
			this.$addressQrCode = this.$('.address-qr-code');
			this.$cryptoAmount = this.$('.crypto.amount');
			_.defer(this.queryRate);
		},

		onChangeRate: function() {

			var cryptoAmount = this.model.getCryptoAmount();

			this.renderCryptoAmount(cryptoAmount);

			this.paymentMethod.generatePaymentRequest(cryptoAmount, _.bind(function(error, paymentRequest) {

				if (error) {
					return app.mainView.showMessage(error);
				}

				this.model.set({
					data: paymentRequest.data,
					uri: paymentRequest.uri,
					status: 'pending',
				});
				this.renderQrCode();
				this.startListeningForPayment();
				this.savePaymentRequestTimeout = _.delay(_.bind(function() {
					this.model.save();
				}, this), 5000);

			}, this));
		},

		renderCryptoAmount: function(cryptoAmount) {

			var currency = this.model.get('currency');
			var paymentMethod = this.paymentMethod;

			if (paymentMethod.code === currency) {
				this.$cryptoAmount.find('.amount-value').text('');
				this.$cryptoAmount.removeClass('visible');
			} else {
				var formattedAmount = app.util.formatNumber(cryptoAmount, paymentMethod.code);
				this.$cryptoAmount.find('.amount-value').text(formattedAmount);
				this.$cryptoAmount.addClass('visible');
			}
		},

		renderQrCode: function(done) {

			var width = Math.min(
				this.$address.width(),
				this.$address.height()
			);

			var data = this.model.get('uri');

			app.busy();

			app.util.renderQrCode(this.$addressQrCode/* $target */, data, {
				width: width,
			}, function(error) {

				app.busy(false);

				done && done();

				if (error) {
					return app.mainView.showMessage(error);
				}
			});
		},

		startListeningForPayment: function() {

			var paymentRequest = this.model.toJSON();
			var received = false;
			var timedOut = false;
			var errorWhileWaiting;

			this.paymentMethod.listenForPayment(paymentRequest, function(error, wasReceived) {
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

				var status = received ? 'unconfirmed' : 'timed-out';
				this.model.save({ status: status });
				app.router.navigate('payment-status/' + status, { trigger: true });

			}, this);

			var iteratee = _.bind(function(next) {
				if (errorWhileWaiting) {
					return next(errorWhileWaiting);
				} else {
					this.listenerTimeOut = _.delay(next, 100);
				}
			}, this);

			this.timerForTimeOut = setTimeout(function() {
				timedOut = true;
			}, app.config.paymentRequests.maxPendingTime);

			async.until(function() { return received || timedOut; }, iteratee, done);
		},

		stopListeningForPayment: function() {

			if (this.paymentMethod) {
				this.paymentMethod.stopListeningForPayment();
			}
			clearTimeout(this.listenerTimeOut);
			clearTimeout(this.timerForTimeOut);
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

			// Navigate back to the choose payment method screen.
			app.router.navigate('choose-payment-method', { trigger: true });
		},

		onResize: function() {

			this.renderQrCode();
		},

		onClose: function() {

			clearTimeout(this.savePaymentRequestTimeout);
			this.stopListeningForPayment();
		},

		onBackButton: function() {

			this.back();
		},

	});

})();
