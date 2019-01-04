'use strict';

var _ = require('underscore');
var expect = require('chai').expect;
var helpers = require('../helpers');
var manager = require('../../manager');
var querystring = require('querystring');
require('../global-hooks');

describe('#display-payment-address', function() {

	var socketServer;
	beforeEach(function() {
		socketServer = manager.socketServer();
	})

	beforeEach(function(done) {
		manager.onAppLoaded(done);
	});

	beforeEach(function() {
		socketServer.primus.write({
			channel: 'exchange-rates',
			data: {'BTC':1.00000000,'CZK':142155.31,'EUR':5467.50,'LTC':77.85130401,'USD':6389.06,'XMR':49.66476285075738763347},
		});
	});

	beforeEach(function(done) {
		manager.evaluateInPageContext(function() {
			app.setDeveloperMode(true);
			app.markGettingStartedAsComplete();
			app.settings.set('configurableCryptoCurrencies', ['bitcoinTestnet']);
			app.settings.set('bitcoinTestnet.extendedPublicKey', 'tpubDD8itYXaDtaTuuouxqdvxfYthFvs8xNbheGxwEcGXJyxrzuyMAxv4xbsw96kz4wKLjSyn3Dd8gbB7kF1bdJdphz1ZA9Wf1Vbgrm3tTZVqSs');
			app.settings.set('displayCurrency', 'EUR');
			app.config.paymentRequests.saveDelay = 0;
		}, done);
	});

	beforeEach(function(done) {
		manager.navigate('/#pay', done);
	});

	beforeEach(function(done) {
		var pressNumberPadKey = helpers['#pay'].pressNumberPadKey;
		pressNumberPadKey('1').then(function() {
			manager.page.click('.button.continue').then(function() {
				var hash = manager.getPageLocationHash();
				expect(hash).to.equal('choose-payment-method');
				done();
			}).catch(done);
		}).catch(done);
	});

	beforeEach(function(done) {
		helpers['#choose-payment-method'].selectPaymentMethod('bitcoinTestnet').then(function() {
			var hash = manager.getPageLocationHash();
			expect(hash).to.equal('display-payment-address');
			done();
		}).catch(done);
	});

	afterEach(function() {
		socketServer.close();
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
				expect(backgroundImage.length > 400).to.equal(true);
				expect(backgroundImage.indexOf('url("data:image/jpeg;base64,')).to.not.equal(-1);
				done();
			}).catch(done);
		}).catch(done);
	});

	it('back', function(done) {
		manager.page.click('.button.back').then(function() {
			var hash = manager.getPageLocationHash();
			expect(hash).to.equal('choose-payment-method');
			manager.evaluateInPageContext(function() {
				var paymentRequest = app.paymentRequests.findWhere({ status: 'pending' });
				return Promise.resolve(paymentRequest && paymentRequest.toJSON() || null);
			}, function(error, paymentRequest) {
				if (error) return done(error);
				expect(paymentRequest).to.not.equal(null);
				expect(paymentRequest).to.be.an('object');
				expect(paymentRequest.amount).to.equal('1');
				expect(paymentRequest.method).to.equal(null);
				done();
			});
		}).catch(done);
	});

	it('cancel', function(done) {
		manager.page.click('.button.cancel').then(function() {
			var hash = manager.getPageLocationHash();
			expect(hash).to.equal('pay');
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
				expect(paymentRequest).to.not.equal(null);
				expect(paymentRequest).to.be.an('object');
				expect(paymentRequest.amount).to.equal(null);
				expect(paymentRequest.method).to.equal(null);
				done();
			});
		}).catch(done);
	});

	describe('warning: payment-method-inactive', function() {

		var selector = '.warning-payment-method-inactive';
		var active = true;
		var sendStatusInterval;
		beforeEach(function() {
			sendStatusInterval = setInterval(function() {
				socketServer.primus.write({
					channel: 'status-check?' + querystring.stringify({
						network: 'bitcoinTestnet',
					}),
					data: { bitcoinTestnet: active },
				});
			}, 5);
		});

		afterEach(function() {
			clearInterval(sendStatusInterval);
		});

		it('not visible when active', function(done) {
			active = true;
			manager.page.waitFor(selector, { visible: false }).then(function() {
				done();
			}).catch(done);
		});

		it('visible when inactive', function(done) {
			active = false;
			manager.page.waitFor(selector, { visible: true }).then(function() {
				done();
			}).catch(done);
		});
	});
});
