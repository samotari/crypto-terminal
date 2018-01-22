'use strict';

var helpers = require('./util/helpers');
var assert = require('assert');

describe('Settings', function() {

	var uri = 'http://localhost:3001/#settings';

	var client;
	before(function() {
		client = helpers.createClient();
	});

	after(function(done) {
		client.end().then(function() {
			client = null;
			done();
		}).catch(done);
	});

	it('accepted currencies', function(done) {
		client.url(uri)
			.waitForVisible('#view .settings.view')
			.isExisting('#settings-configurableCryptoCurrencies-bitcoin:not(:checked)')
			.click('label[for="settings-configurableCryptoCurrencies-bitcoin"]')
			.isExisting('#settings-configurableCryptoCurrencies-bitcoin:checked')
			.waitForVisible('.form-group.bitcoin')
			.then(function() {
				done();
			})
			.catch(done);
	});

	it('doesn\'t allow to save empty settings', function(done) {
		client.url(uri)
			.waitForVisible('#view .settings.view')
			.isExisting('input.button.form-button.save[type="submit"]')
			.isExisting('#settings-configurableCryptoCurrencies-bitcoin:not(:checked)')
			// add other crypto currencies
			.click('input.button.form-button.save[type="submit"]')
			.isExisting('.error')
			.waitForVisible('.error')
			.then(function() {
				done();
			})
			.catch(done);
	});

	it('shouldn\'t display a select payment method view without any payment method available', function(done) {
		client.url(uri)
			.waitForVisible('#view .settings.view')
			.isExisting('a.header-button.home')
			.click('a.header-button.home')
			.waitForVisible('#view .pay.view')
			.isExisting('.numpad .numpad-key[data-value="1"]')
			.click('.numpad .numpad-key[data-value="1"]')
			.isExisting('.button.continue')
			.click('.button.continue')
			.waitForVisible('#view .choose-payment-method.view')
			.isExisting('.select-payment-method')
			.getText('.select-payment-method')
			.then(function(content) {
				assert.fail(content,'', 'The content of div.select-payment-method should not be empty.');
				done();
			})
			.catch(done);
	});

	it('show error when input MPK is empty', function(done) {
		
		client.url(uri)
			.waitForVisible('#view .settings.view')
			.isExisting('#settings-configurableCryptoCurrencies-bitcoin:not(:checked)')
			.click('label[for="settings-configurableCryptoCurrencies-bitcoin"]')
			.isExisting('#settings-configurableCryptoCurrencies-bitcoin:checked')
			.waitForVisible('.form-group.bitcoin')
			.addValue('#settings-bitcoin-xpub', '')
			.click('.save')
			.waitForVisible('.form-error')
			.then(function() {
				done();
			})
			.catch(done);
	});

});
