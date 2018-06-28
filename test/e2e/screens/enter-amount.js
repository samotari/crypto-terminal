'use strict';

var _ = require('underscore');
var expect = require('chai').expect;
var manager = require('../../manager');
require('../global-hooks');

describe('#pay', function() {

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

	var pressNumberPadKey = function(key) {
		var selector;
		if (key === 'backspace') {
			selector = '.number-pad .button.backspace';
		} else if (key === 'decimal') {
			selector = '.number-pad .button.decimal';
		} else {
			selector = '.number-pad .button[data-key="' + key + '"]';
		}
		return manager.page.click(selector);
	};

	var checkValue = function(expectedValue) {
		return new Promise(function(resolve, reject) {
			manager.page.$eval('.amount-value', function(el) {
				return el.textContent;
			}).then(function(value) {
				try {
					expect(value).to.equal(expectedValue);
				} catch (error) {
					return reject(error);
				}
				resolve();
			}).catch(reject);
		});
	};

	it('number pad exists', function(done) {
		manager.page.waitFor('.view.pay .number-pad').then(function() {
			done();
		}).catch(done);
	});

	it('error message shown when no amount entered', function(done) {
		manager.page.click('.button.continue').then(function() {
			manager.page.waitFor('#message.visible').then(function() {
				done();
			}).catch(done);
		}).catch(done);
	});

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
					done();
				}).catch(done);
			}).catch(done);
		}).catch(done);
	});
});
