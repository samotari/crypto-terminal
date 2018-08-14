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

		listenerTimeOut: null,
		savePaymentRequestTimeout: null,
		statusListener: null,

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
						app.busy(false);
						if (error) {
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
				this.startListeningForStatus();
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
			var errorWhileWaiting;
			var data;

			this.paymentMethod.listenForPayment(paymentRequest, function(error, paymentData) {
				if (error) {
					errorWhileWaiting = error;
				} else {
					data = paymentData;
					received = true;
				}
			});

			var done = _.bind(function(error) {

				this.stopListeningForPayment();

				if (error) {
					return app.mainView.showMessage(error);
				}

				var status = received ? 'unconfirmed' : 'timed-out';
				this.model.save(
					_.extend(
						{},
						paymentRequest,
						{
							status: status,
							data: _.extend(
								{},
								paymentRequest.data,
								data || {}
							)
						}
					)
				);
				app.router.navigate('payment-status/' + status, { trigger: true });

			}, this);

			var iteratee = _.bind(function(next) {
				if (errorWhileWaiting) {
					return next(errorWhileWaiting);
				} else {
					this.listenerTimeOut = _.delay(next, 50);
				}
			}, this);

			var startTime = Date.now();
			async.until(function() {
				var elapsedTime = Date.now() - startTime;
				var timedOut = elapsedTime > app.config.paymentRequests.timeout;
				return received || timedOut;
			}, iteratee, done);
		},

		stopListeningForPayment: function() {

			if (this.paymentMethod) {
				this.paymentMethod.stopListeningForPayment();
			}
			clearTimeout(this.listenerTimeOut);
		},

		startListeningForStatus: function() {
			var paymentRequest = this.model.toJSON();
			var paymentMethod = paymentRequest.method;
			this.statusListener = {};
			this.statusListener.channel = 'status-check?' + querystring.stringify({
				network: paymentMethod,
			});
			this.statusListener.listener = function(status) {
				var paymentMethodActive = status[paymentMethod] || false;
				$('.view.display-payment-address').toggleClass('payment-method-inactive', !paymentMethodActive);
			}

			app.services.ctApi.subscribe(this.statusListener.channel, this.statusListener.listener);
		},

		stopListeningForStatus: function() {

			if (this.statusListener && this.statusListener.channel && this.statusListener.listener) {
				var channel = this.statusListener.channel;
				var listener = this.statusListener.listener;
				app.services.ctApi.unsubscribe(channel, listener);
			}
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
			this.stopListeningForStatus();
		},

		onBackButton: function() {

			this.back();
		},

	});

})();
