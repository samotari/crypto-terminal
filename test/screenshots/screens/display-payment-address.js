'use strict';

var _ = require('underscore');
var expect = require('chai').expect;
var helpers = require('../../e2e/helpers');
var manager = require('../../manager');

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

	var screenshots = [
		{
			name: 'display-payment-address',
			fn: function(done) {
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
			},
		},
	];

	_.each(screenshots, function(screenshot) {
		describe('screenshot:' + screenshot.name, function() {
			after(function(done) {
				manager.screenshot(screenshot.name, done);
			});
			it('setup', screenshot.fn);
		});
	});
});
