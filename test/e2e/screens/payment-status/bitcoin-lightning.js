'use strict';

var express = require('express');
var helpers = require('../../helpers');
var manager = require('../../../manager');
require('../../global-hooks');

describe('#payment-status [bitcoin-lightning]', function() {

	var server;
	beforeEach(function() {
		var paymentRequest = { payment_request: '4g5f6d8r3dwD6sF8e5kaM', r_hash: '123546346' };
		var id = Buffer.from(paymentRequest.r_hash, 'base64').toString('hex');
		var tmpApp = express();
		tmpApp.use(function(req, res, next) {
			res.header('Access-Control-Allow-Origin', '*');
			res.header('Access-Control-Allow-Headers', '*');
			next();
		});
		server = tmpApp.listen(3700, 'localhost');
		tmpApp.post('/v1/invoices', function(req, res, next) {
			res.send(paymentRequest);
		});
		tmpApp.get('/v1/invoice/' + encodeURIComponent(id), function(req, res, next) {
			res.send({ settled: true, settle_date: Date.now() });
		});
	});

	beforeEach(function(done) {
		manager.evaluateInPageContext(function() {
			app.markGettingStartedAsComplete();
			app.settings.set('configurableCryptoCurrencies', ['bitcoinLightning']);
			app.settings.set('bitcoinLightning.apiUrl', 'http://localhost:3700');
			app.settings.set('bitcoinLightning.invoiceMacaroon', '12345679');
			app.settings.set('displayCurrency', 'BTC');
		}, done);
	});

	beforeEach(function(done) {
		manager.navigate('/#pay', done);
	});

	beforeEach(function(done) {
		helpers['#pay'].setAmount('0.0000001', done);
	});

	beforeEach(function(done) {
		helpers['#pay'].continue(done);
	});

	afterEach(function() {
		server.close();
	});

	it('accepts payment if invoice is "settled"', function(done) {
		manager.page.waitFor('.view.payment-status.unconfirmed').then(function() {
			manager.page.waitFor('.result-indicator').then(function() {
				done();
			}).catch(done);
		}).catch(done);
	});
});
