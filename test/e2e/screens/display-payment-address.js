'use strict';

var _ = require('underscore');
var expect = require('chai').expect;
var helpers = require('../helpers');
var manager = require('../../manager');
require('../global-hooks');

describe('#display-payment-address', function() {

	beforeEach(function(done) {
		manager.onAppLoaded(done);
	});

	beforeEach(function(done) {
		manager.evaluateInPageContext(function() {
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

	beforeEach(function(done) {
		helpers['#choose-payment-method'].selectPaymentMethod('bitcoinTestnet').then(function() {
			var hash = manager.getPageLocationHash();
			expect(hash).to.equal('display-payment-address');
			done();
		}).catch(done);
	});

	it('QR code rendered', function(done) {
		manager.page.waitFor('.view.display-payment-address .address-qr-code').then(function() {
			manager.page.$eval('.view.display-payment-address .address-qr-code', function(el) {
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
				var paymentRequest = app.paymentRequests.findWhere({ status: 'pending' });
				return Promise.resolve(paymentRequest && paymentRequest.toJSON() || null);
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
});
