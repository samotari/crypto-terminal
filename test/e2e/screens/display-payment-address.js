'use strict';

var _ = require('underscore');
var expect = require('chai').expect;
var helpers = require('../helpers');
var manager = require('../../manager');
require('../global-hooks');

describe('#display-payment-address', function() {

	describe('only one payment method', function() {

		beforeEach(function(done) {
			manager.evaluateInPageContext(function() {
				app.markGettingStartedAsComplete();
				app.settings.set('configurableCryptoCurrencies', ['bitcoinTestnet']);
				app.settings.set('bitcoinTestnet.extendedPublicKey', 'vpub5UG3QqhKbZ8bL7PNw6om29xk7Bhm6BhtCwoYhF8MF5aF1s843gPFjVqQn5kS43dArrzkr8jwKbLCAt3dkpkkjd8VmuRwwmmRK4PMTtTjnNJ');
				app.settings.set('displayCurrency', 'BTC');
				app.config.paymentRequests.saveDelay = 0;
			}, done);
		});

		beforeEach(function(done) {
			manager.navigate('/#pay', done);
		});

		beforeEach(function(done) {
			helpers['#pay'].setAmount('0.001', done);
		});

		beforeEach(function(done) {
			helpers['#pay'].continue(done);
		});

		it('skips the #choose-payment-method screen', function() {
			var hash = manager.getPageLocationHash();
			// Should skip the #choose-payment-method screen.
			expect(hash).to.equal('display-payment-address');
		});

		it('back', function(done) {
			manager.page.click('.button.back').then(function() {
				try {
					var hash = manager.getPageLocationHash();
					expect(hash).to.equal('pay');
				} catch (error) {
					return done(error);
				}
				manager.evaluateInPageContext(function() {
					var paymentRequest = app.paymentRequests.findWhere({ status: 'pending' });
					return Promise.resolve(paymentRequest && paymentRequest.toJSON() || null);
				}, function(error, paymentRequest) {
					if (error) return done(error);
					try {
						expect(paymentRequest).to.not.equal(null);
						expect(paymentRequest).to.be.an('object');
						expect(paymentRequest.amount).to.equal(null);
						expect(paymentRequest.method).to.equal(null);
					} catch (error) {
						return done(error);
					}
					done();
				});
			}).catch(done);
		});
	});

	describe('more than one payment method', function() {

		beforeEach(function(done) {
			manager.evaluateInPageContext(function() {
				app.markGettingStartedAsComplete();
				// Must configure more than one payment method to be able to view the #choose-payment-method screen.
				app.settings.set('configurableCryptoCurrencies', ['bitcoin', 'bitcoinTestnet']);
				app.settings.set('bitcoin.extendedPublicKey', 'xpub69V9b3wdTWG6Xjtpz5dX8ULpqLKzci3o7YCb6xQUpHAhf3dzFBNeM4GXTSBff82Zh524oHpSPY4XimQMCbxAsprrh7GmCNpp9GNdrHxxqJo');
				app.settings.set('bitcoinTestnet.extendedPublicKey', 'vpub5UG3QqhKbZ8bL7PNw6om29xk7Bhm6BhtCwoYhF8MF5aF1s843gPFjVqQn5kS43dArrzkr8jwKbLCAt3dkpkkjd8VmuRwwmmRK4PMTtTjnNJ');
				app.settings.set('displayCurrency', 'BTC');
				app.config.paymentRequests.saveDelay = 0;
			}, done);
		});

		beforeEach(function(done) {
			manager.navigate('/#pay', done);
		});

		beforeEach(function(done) {
			helpers['#pay'].setAmount('0.001', done);
		});

		beforeEach(function(done) {
			helpers['#pay'].continue(done);
		});

		beforeEach(function(done) {
			helpers['#choose-payment-method'].selectPaymentMethod('bitcoinTestnet').then(function() {
				var hash = manager.getPageLocationHash();
				expect(hash).to.equal('display-payment-address');
				done();
			}).catch(done);
		});

		it('QR code rendered', function(done) {
			manager.page.waitFor(function() {
				return new Promise(function(resolve, reject) {
					try {
						async.until(function() {
							var $el = $('.address-qr-code');
							var backgroundImage = $el.css('background-image');
							return backgroundImage.indexOf('url("data:image/jpeg;base64,') !== -1;
						}, function(next) {
							_.delay(next, 5);
						}, function() {
							resolve(true);
						});
					} catch (error) {
						return reject(error);
					}
				});
			}).then(function() {
				manager.page.$eval('.address-qr-code', function(el) {
					return el.style['background-image'];
				}).then(function(backgroundImage) {
					try {
						expect(backgroundImage.length > 400).to.equal(true);
						expect(backgroundImage.indexOf('url("data:image/jpeg;base64,')).to.not.equal(-1);
					} catch (error) {
						return done(error);
					}
					done();
				}).catch(done);
			}).catch(done);
		});

		it('back', function(done) {
			manager.page.click('.button.back').then(function() {
				try {
					var hash = manager.getPageLocationHash();
					expect(hash).to.equal('choose-payment-method');
				} catch (error) {
					return done(error);
				}
				manager.evaluateInPageContext(function() {
					var paymentRequest = app.paymentRequests.findWhere({ status: 'pending' });
					return Promise.resolve(paymentRequest && paymentRequest.toJSON() || null);
				}, function(error, paymentRequest) {
					if (error) return done(error);
					try {
						expect(paymentRequest).to.not.equal(null);
						expect(paymentRequest).to.be.an('object');
						expect(paymentRequest.amount).to.equal('0.001');
						expect(paymentRequest.method).to.equal(null);
					} catch (error) {
						return done(error);
					}
					done();
				});
			}).catch(done);
		});

		it('cancel', function(done) {
			manager.page.click('.button.cancel').then(function() {
				try {
					var hash = manager.getPageLocationHash();
					expect(hash).to.equal('pay');
				} catch (error) {
					return done(error);
				}
				manager.evaluateInPageContext(function() {
					return new Promise(function(resolve, reject) {
						var paymentRequest;
						async.until(function() {
							paymentRequest = app.paymentRequests.findWhere({ status: 'pending' });
							return !!paymentRequest;
						}, function(next) {
							setTimeout(next, 5);
						}, function(error) {
							if (error) return reject(error);
							resolve(paymentRequest && paymentRequest.toJSON() || null);
						});
					});
				}, function(error, paymentRequest) {
					if (error) return done(error);
					try {
						expect(paymentRequest).to.not.equal(null);
						expect(paymentRequest).to.be.an('object');
						expect(paymentRequest.amount).to.equal(null);
						expect(paymentRequest.method).to.equal(null);
					} catch (error) {
						return done(error);
					}
					done();
				});
			}).catch(done);
		});

		describe('warning: payment-method-inactive', function() {

			describe('connected to electrum server', function() {

				beforeEach(function(done) {
					manager.connectElectrumClient('bitcoinTestnet', ['127.0.0.1 t51001'], done);
				});

				it('warning is not visible', function(done) {
					manager.page.waitFor('.warning-payment-method-inactive', { visible: false }).then(function() {
						done();
					}).catch(done);
				});
			});

			describe('not connected to electrum server', function() {

				it('warning is visible', function(done) {
					manager.page.waitFor('.warning-payment-method-inactive', { visible: true }).then(function() {
						done();
					}).catch(done);
				});
			});
		});
	});
});
