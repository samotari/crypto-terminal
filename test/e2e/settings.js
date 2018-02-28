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

	// This is left here as a reference for future end-to-end tests.
	// it('accepted currencies', function(done) {
	// 	client.url(uri)
	// 		.waitForVisible('#view .settings.view')
	// 		.isExisting('#settings-configurableCryptoCurrencies-bitcoin:not(:checked)')
	// 		.click('label[for="settings-configurableCryptoCurrencies-bitcoin"]')
	// 		.isExisting('#settings-configurableCryptoCurrencies-bitcoin:checked')
	// 		.waitForVisible('.form-group.bitcoin')
	// 		.then(function() {
	// 			done();
	// 		})
	// 		.catch(done);
	// });
});
