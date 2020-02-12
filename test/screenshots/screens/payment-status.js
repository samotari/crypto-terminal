'use strict';

var _ = require('underscore');
var expect = require('chai').expect;
var helpers = require('../../e2e/helpers');
var manager = require('../../manager');

describe('#display-payment-address', function() {

	it('payment success', function(done) {
		manager.navigate('/#payment-status/unconfirmed', function(error) {
			if (error) return done(error);
			manager.page.waitFor('.view.payment-status.unconfirmed').then(function() {
				manager.page.waitFor('.result-indicator').then(function() {
					setTimeout(done, 1200);
				}).catch(done);
			}).catch(done);
		});
	});
});
