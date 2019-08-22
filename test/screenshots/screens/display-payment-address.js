'use strict';

var _ = require('underscore');
var expect = require('chai').expect;
var helpers = require('../../e2e/helpers');
var manager = require('../../manager');

describe('#display-payment-address', function() {

	beforeEach(function(done) {
		manager.navigate('/#pay', done);
	});

	beforeEach(function(done) {
		helpers['#pay'].setAmount('0.001', done);
	});

	beforeEach(function(done) {
		helpers['#pay'].continue(done);
	});

	beforeEach(function(done) {
		helpers['#choose-payment-method'].selectPaymentMethod('bitcoinTestnet').then(function() {
			done();
		}).catch(done);
	});

	it('ready', function(done) {
		manager.page.waitFor(function() {
			return new Promise(function(resolve, reject) {
				try {
					async.until(function() {
						var $el = $('.address-qr-code');
						var backgroundImage = $el.css('background-image');
						return backgroundImage.indexOf('url("data:image/jpeg;base64,') !== -1;
					}, function(next) {
						_.delay(next, 5);
					}, function() {
						resolve(true);
					});
				} catch (error) {
					return reject(error);
				}
			});
		}).then(function() {
			manager.page.$eval('.address-qr-code', function(el) {
				return el.style['background-image'];
			}).then(function(backgroundImage) {
				try {
					expect(backgroundImage.length > 400).to.equal(true);
					expect(backgroundImage.indexOf('url("data:image/jpeg;base64,')).to.not.equal(-1);
				} catch (error) {
					return done(error);
				}
				done();
			}).catch(done);
		}).catch(done);
	});
});
