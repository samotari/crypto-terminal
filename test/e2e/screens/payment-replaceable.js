'use strict';

var _ = require('underscore');
var async = require('async');
var querystring = require('querystring');

var helpers = require('../helpers');
var manager = require('../../manager');
require('../global-hooks');

describe('#payment-replaceable [bitcoin]', function() {

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
			app.markGettingStartedAsComplete();
			app.settings.set('configurableCryptoCurrencies', ['bitcoinTestnet']);
			app.settings.set('bitcoinTestnet.extendedPublicKey', 'tpubDD8itYXaDtaTuuouxqdvxfYthFvs8xNbheGxwEcGXJyxrzuyMAxv4xbsw96kz4wKLjSyn3Dd8gbB7kF1bdJdphz1ZA9Wf1Vbgrm3tTZVqSs');
			app.settings.set('displayCurrency', 'EUR');
		}, done);
	});

	beforeEach(function(done) {
		manager.navigate('/#pay', done);
	});

	beforeEach(function(done) {
		var pressNumberPadKey = helpers['#pay'].pressNumberPadKey;
		pressNumberPadKey('1').then(function() {
			manager.page.click('.button.continue').then(function() {
				manager.page.waitFor('.view.choose-payment-method .button.payment-method.bitcoinTestnet').then(function() {
					helpers['#choose-payment-method'].selectPaymentMethod('bitcoinTestnet').then(function() {
						done();
					})
				}).catch(done);
			}).catch(done);
		}).catch(done);
	});

	afterEach(function() {
		socketServer.close();
	});

	describe('accepting replaceable transaction', function() {

		it('should show pay screen', function(done) {
			var address = 'mocgFTsFarDc6ACyso8xhAbKjtfGYW42UY';
			var channel = 'v1/new-txs?' + querystring.stringify({
				address: address,
				network: 'bitcoinTestnet',
			});
			manager.page.waitFor('.address-qr-code').then(function() {
				manager.page.waitFor(function(channel) {
					return new Promise(function(resolve, reject) {
						try {
							async.until(function() {
								return app.services.ctApi.isSubscribed(channel);
							}, function(next) {
								_.delay(next, 5);
							}, function() {
								resolve(true);
							});
						} catch (error) {
							return reject(error);
						}
					});
				}, {}/* options */, channel).then(function() {
					socketServer.primus.write({
						channel: channel,
						data: {
							address: address,
							amount: 100000000,
							txid: 'this-is-a-testing-transaction-id',
							isReplaceable: true
						}
					});
					manager.page.waitFor('.view.payment-replaceable').then(function() {
						manager.page.waitFor('.result-indicator').then(function() {
							manager.page.click('.button.accept').then(function() {
								manager.page.waitFor('.view.pay').then(function() {
									done();
								})
							})
						}).catch(done);
					}).catch(done);
				}).catch(done);
			}).catch(done);
		});
	});

	describe('rejecting replaceable transaction', function() {

		it('should show display payment address screen', function(done) {
			var address = 'mhgMkiZiqCmqDaT8b3E6uUD5xmvoKJEBpx';
			var channel = 'v1/new-txs?' + querystring.stringify({
				address: address,
				network: 'bitcoinTestnet',
			});
			manager.page.waitFor('.address-qr-code').then(function() {
				manager.page.waitFor(function(channel) {
					return new Promise(function(resolve, reject) {
						try {
							async.until(function() {
								return app.services.ctApi.isSubscribed(channel);
							}, function(next) {
								_.delay(next, 5);
							}, function() {
								resolve(true);
							});
						} catch (error) {
							return reject(error);
						}
					});
				}, {}/* options */, channel).then(function() {
					socketServer.primus.write({
						channel: channel,
						data: {
							address: address,
							amount: 100000000,
							txid: 'this-is-a-testing-transaction-id',
							isReplaceable: true
						}
					});
					manager.page.waitFor('.view.payment-replaceable').then(function() {
						manager.page.waitFor('.result-indicator').then(function() {
							manager.page.click('.button.reject').then(function() {
								manager.page.waitFor('.address-qr-code').then(function() {
									done();
								})
							})
						}).catch(done);
					}).catch(done);
				}).catch(done);
			}).catch(done);
		});
	});


});
