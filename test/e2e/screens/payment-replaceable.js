'use strict';

var _ = require('underscore');
var async = require('async');

var helpers = require('../helpers');
var manager = require('../../manager');
require('../global-hooks');

describe('#payment-replaceable [bitcoin]', function() {

	beforeEach(function(done) {
		manager.evaluateInPageContext(function() {
			app.markGettingStartedAsComplete();
			// Must configure more than one payment method to be able to view the #choose-payment-method screen.
			app.settings.set('configurableCryptoCurrencies', ['bitcoinTestnet']);
			app.settings.set('bitcoinTestnet.extendedPublicKey', 'vpub5UG3QqhKbZ8bL7PNw6om29xk7Bhm6BhtCwoYhF8MF5aF1s843gPFjVqQn5kS43dArrzkr8jwKbLCAt3dkpkkjd8VmuRwwmmRK4PMTtTjnNJ');
			app.settings.set('displayCurrency', 'BTC');
		}, done);
	});

	var client;
	beforeEach(function(done) {
		manager.connectElectrumClient('bitcoinTestnet', ['127.0.0.1 t51001'], function(error, socket) {
			if (error) return done(error);
			client = socket;
			done();
		});
	});

	beforeEach(function(done) {
		manager.evaluateInPageContext(function() {
			// Reset the address index so that the same address is used for each test.
			app.settings.set('bitcoinTestnet.addressIndex', '0');
		}, done);
	});

	beforeEach(function(done) {
		manager.navigate('/#pay', done);
	});

	beforeEach(function(done) {
		helpers['#pay'].setAmount('0.001', done);
	});

	beforeEach(function(done) {
		this.timeout(500000);
		// var address = 'tb1qv6ftlj0u9tcpjuq3jtfsj7wl9swp83kkhm7yp5';
		var tx = {
			fees: 1250,
			height: 1519412,
			hex: '0200000000010132584a671d6626887bc84a0bfb25d1ee14cb3cd5cb86fbf0fc6969021e84a9130100000000f7ffffff015e3d0f00000000001600146692bfc9fc2af019701192d30979df2c1c13c6d6024730440220363b1bf683e0403c571349fb59be8eca6e64f3c82ced52b794209bf937bc70320220015660dee93fb4a4033cc4f684f37b3ee225c7533ee90fac615c3efb4d009818012103cea1427b46ae703eb27d08b8cc81df44e179b446a2a2c78452b515d3ef52997500000000',
			tx_hash: 'd878f302147331a4764bdda133163b4a84fada11e0671695bc36232f7757a78f',
		};
		manager.socketServer.mock.receiveTx(client, tx, done);
		helpers['#pay'].continue(function(error) {
			if (error) return done(error);
		});
	});

	it('shows warning', function(done) {
		manager.page.waitFor('.view.payment-replaceable').then(function() {
			manager.page.waitFor('.result-indicator').then(function() {
				done();
			}).catch(done);
		}).catch(done);
	});

	it('shows payment success after clicking accept button', function(done) {
		manager.page.waitFor('.view.payment-replaceable').then(function() {
			manager.page.click('.button.accept').then(function() {
				manager.page.waitFor('.view.payment-status.unconfirmed').then(function() {
					manager.page.waitFor('.result-indicator').then(function() {
						done();
					}).catch(done);
				}).catch(done);
			}).catch(done);
		}).catch(done);
	});

	it('shows payment screen again after clicking reject button', function(done) {
		manager.page.waitFor('.view.payment-replaceable').then(function() {
			manager.page.click('.button.reject').then(function() {
				manager.page.waitFor('.address-qr-code').then(function() {
					done();
				}).catch(done);
			}).catch(done);
		}).catch(done);
	});
});
