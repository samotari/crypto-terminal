'use strict';

var _ = require('underscore');
var expect = require('chai').expect;
var helpers = require('../helpers');
var manager = require('../../manager');
require('../global-hooks');

describe('#choose-payment-method', function() {

	beforeEach(function(done) {
		manager.onAppLoaded(done);
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
				var hash = manager.getPageLocationHash();
				expect(hash).to.equal('choose-payment-method');
				done();
			}).catch(done);
		}).catch(done);
	});

	it('payment option(s) exist', function(done) {
		manager.page.waitFor('.view.choose-payment-method .button.payment-method.bitcoinTestnet').then(function() {
			done();
		}).catch(done);
	});

	it('canceling', function(done) {
		manager.page.click('.button.cancel').then(function() {
			var hash = manager.getPageLocationHash();
			expect(hash).to.equal('pay');
			manager.evaluateInPageContext(function() {
				var paymentRequest = app.paymentRequests.findWhere({ status: 'pending' });
				return Promise.resolve(paymentRequest && paymentRequest.toJSON() || null);
			}, function(error, paymentRequest) {
				if (error) return done(error);
				expect(paymentRequest).to.not.equal(null);
				expect(paymentRequest).to.be.an('object');
				expect(paymentRequest.amount).to.equal(null);
				done();
			});
		}).catch(done);
	});

	it('selecting a payment method', function(done) {
		helpers['#choose-payment-method'].selectPaymentMethod('bitcoinTestnet').then(function() {
			var hash = manager.getPageLocationHash();
			expect(hash).to.equal('display-payment-address');
			manager.evaluateInPageContext(function() {
				var paymentRequest = app.paymentRequests.findWhere({ status: 'pending' });
				return Promise.resolve(paymentRequest && paymentRequest.toJSON() || null);
			}, function(error, paymentRequest) {
				if (error) return done(error);
				expect(paymentRequest).to.not.equal(null);
				expect(paymentRequest).to.be.an('object');
				expect(paymentRequest.amount).to.equal('1');
				expect(paymentRequest.method).to.equal('bitcoinTestnet');
				done();
			});
		}).catch(done);
	});
});
