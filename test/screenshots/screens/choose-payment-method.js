'use strict';

var helpers = require('../../e2e/helpers');
var manager = require('../../manager');

describe('#choose-payment-method', function() {

	beforeEach(function(done) {
		manager.evaluateInPageContext(function() {
			app.settings.set('configurableCryptoCurrencies', ['bitcoin', 'bitcoinLightning', 'litecoin']);
			app.settings.set('litecoin.extendedPublicKey', 'ypub6WVbiJsEPVGWBXUwKUXU9Wq354c2mkkehpqpjerAkziizWRAK4u43RMLHXEUXG2R9ECmmqj28472xzXYsrEaWCrmFRnZVCRs6ePZaAhT1Pw');
		}, done);
	});

	beforeEach(function(done) {
		manager.navigate('/#pay', done);
	});

	beforeEach(function(done) {
		helpers['#pay'].setAmount('3', done);
	});

	beforeEach(function(done) {
		helpers['#pay'].continue(done);
	});

	it('multiple payment options', function(done) {
		manager.page.waitFor('.view.choose-payment-method .button.payment-method').then(function() {
			done();
		}).catch(done);
	});
});
