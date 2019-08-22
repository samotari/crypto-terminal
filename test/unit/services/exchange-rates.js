'use strict';

var _ = require('underscore');
var expect = require('chai').expect;
var manager = require('../../manager');
require('../global-hooks');

describe('services.exchangeRates', function() {

	var tests = [
		{
			provider: 'binance',
			currencies: { from: 'BTC', to: 'USD' },
		},
		{
			provider: 'bitfinex',
			currencies: { from: 'BTC', to: 'USD' },
		},
		{
			provider: 'bitflyer',
			currencies: { from: 'BTC', to: 'USD' },
		},
		{
			provider: 'bitstamp',
			currencies: { from: 'BTC', to: 'USD' },
		},
		{
			provider: 'coinbase',
			currencies: { from: 'BTC', to: 'USD' },
		},
		{
			provider: 'coinmate',
			currencies: { from: 'BTC', to: 'EUR' },
		},
		{
			provider: 'kraken',
			currencies: { from: 'BTC', to: 'USD' },
		},
		{
			provider: 'poloniex',
			currencies: { from: 'BTC', to: 'USD' },
		},
	];

	describe('providers', function() {
		_.each(tests, function(test) {
			it(test.provider, function(done) {
				this.timeout(500000);
				var fn = 'app.services.exchangeRates.get';
				var isAsync = true;
				var evaluateOptions = {
					fn: fn,
					isAsync: isAsync,
					args: [{
						cache: false,
						currencies: test.currencies,
						provider: test.provider,
					}],
				};
				manager.evaluateFn(evaluateOptions, function(error, result) {
					if (error) return done(error);
					try {
						expect(result).to.not.be.null;
						expect(result).to.be.a('string');
						var asNumber = parseFloat(result);
						expect(asNumber).to.be.a('number');
						expect(asNumber > 0).to.equal(true);
					} catch (error) {
						return done(error);
					}
					done();
				});
			});
		});
	});
});
