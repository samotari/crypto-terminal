'use strict';

var expect = require('chai').expect;
var helpers = require('../helpers');
var manager = require('../../manager');
require('../global-hooks');

describe('#pay', function() {

	beforeEach(function(done) {
		manager.onAppLoaded(done);
	});

	beforeEach(function(done) {
		manager.evaluateInPageContext(function() {
			app.setDeveloperMode(true);
			app.markGettingStartedAsComplete();
			app.settings.set('configurableCryptoCurrencies', ['bitcoinTestnet']);
			app.settings.set('bitcoinTestnet.extendedPublicKey', 'tpubDD8itYXaDtaTuuouxqdvxfYthFvs8xNbheGxwEcGXJyxrzuyMAxv4xbsw96kz4wKLjSyn3Dd8gbB7kF1bdJdphz1ZA9Wf1Vbgrm3tTZVqSs');
			app.settings.set('displayCurrency', 'EUR');
		}, done);
	});

	beforeEach(function(done) {
		manager.navigate('/#pay', done);
	});

	it('number pad exists', function(done) {
		manager.page.waitFor('.view.pay .number-pad').then(function() {
			done();
		}).catch(done);
	});

	it('cannot continue when no amount entered', function(done) {
		manager.page.waitFor('.view.pay .button.continue.disabled').then(function() {
			done();
		}).catch(done);
	});

	var checkValue = helpers['#pay'].checkValue;
	var pressNumberPadKey = helpers['#pay'].pressNumberPadKey;

	it('using number pad', function(done) {
		pressNumberPadKey('2').then(function() {
			checkValue('2').then(function() {
				pressNumberPadKey('decimal').then(function() {
					pressNumberPadKey('5').then(function() {
						checkValue('2.5').then(function() {
							pressNumberPadKey('backspace').then(function() {
								pressNumberPadKey('backspace').then(function() {
									checkValue('2').then(function() {
										done();
									}).catch(done);
								}).catch(done);
							}).catch(done);
						}).catch(done);
					}).catch(done);
				}).catch(done);
			}).catch(done);
		}).catch(done);
	});

	it('entering a valid amount', function(done) {
		pressNumberPadKey('2').then(function() {
			pressNumberPadKey('5').then(function() {
				manager.page.click('.button.continue').then(function() {
					var hash = manager.getPageLocationHash();
					expect(hash).to.equal('choose-payment-method');
					manager.evaluateInPageContext(function() {
						var paymentRequest = app.paymentRequests.findWhere({ status: 'pending' });
						return Promise.resolve(paymentRequest && paymentRequest.toJSON() || null);
					}, function(error, paymentRequest) {
						if (error) return done(error);
						expect(paymentRequest).to.not.equal(null);
						expect(paymentRequest).to.be.an('object');
						expect(paymentRequest.amount).to.equal('25');
						done();
					});
				}).catch(done);
			}).catch(done);
		}).catch(done);
	});
});
