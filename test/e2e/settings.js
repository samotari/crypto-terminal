'use strict';

var helpers = require('./util/helpers');
var $ = require('jquery')

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
			.isExisting('#settings-acceptCryptoCurrencies-bitcoin:not(:checked)')
			.click('label[for="settings-acceptCryptoCurrencies-bitcoin"]')
			.isExisting('#settings-acceptCryptoCurrencies-bitcoin:checked')
			.waitForVisible('.form-group.bitcoin')
			.then(function() {
				done();
			})
			.catch(done);
	});

	it('show error when input MPK is empty', function(done) {
		
		client.url(uri)
			.waitForVisible('#view .settings.view')
			.isExisting('#settings-acceptCryptoCurrencies-bitcoin:not(:checked)')
			.click('label[for="settings-acceptCryptoCurrencies-bitcoin"]')
			.isExisting('#settings-acceptCryptoCurrencies-bitcoin:checked')
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
