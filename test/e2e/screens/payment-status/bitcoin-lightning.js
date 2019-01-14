'use strict';

var express = require('express');
var helpers = require('../../helpers');
var manager = require('../../../manager');
require('../../global-hooks');

describe('#payment-status [bitcoin-lightning]', function() {

	var port = 3700;
	var server;
	before(function() {
		var paymentRequest = {payment_request:'4g5f6d8r3dwD6sF8e5kaM', r_hash: '123546346'};
		var id = Buffer.from(paymentRequest.r_hash, 'base64').toString('hex');

		var tmpApp = express();
		tmpApp.use(function(req, res, next) {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "*");
			next();
		});
		server = tmpApp.listen(port, 'localhost');
		tmpApp.post('/v1/invoices', function(req, res, next) {
			res.send(paymentRequest);
		});
		tmpApp.get('/v1/invoice/' + encodeURIComponent(id), function(req, res, next) {
			res.send({settled: true, settle_date: 123});
		})
	})

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
			app.settings.set('configurableCryptoCurrencies', ['bitcoinLightning']);
			app.settings.set('bitcoinLightning.apiUrl', 'http://localhost:3700');
			app.settings.set('bitcoinLightning.invoiceMacaroon', '12345679');
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
				manager.page.waitFor('.view.choose-payment-method .button.payment-method.bitcoinLightning').then(function() {
					helpers['#choose-payment-method'].selectPaymentMethod('bitcoinLightning').then(function() {
						done();
					})
				}).catch(done);
			}).catch(done);
		}).catch(done);
	});

	afterEach(function() {
		socketServer.close();
	});

	afterEach(function() {
		server.close();
	})

	describe('unconfirmed', function() {
		it('should accept payment', function(done) {
			manager.page.waitFor('.address-qr-code').then(function() {
				manager.page.waitFor('.view.payment-status.unconfirmed').then(function() {
					manager.page.waitFor('.result-indicator').then(function() {
						done();
					}).catch(done);
				}).catch(done);
			}).catch(done);
		});
	});
});
