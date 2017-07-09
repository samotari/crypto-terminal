'use strict';

var helpers = require('./util/helpers');

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
});
