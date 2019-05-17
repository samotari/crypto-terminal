'use strict';

var _ = require('underscore');
var expect = require('chai').expect;
var manager = require('../../manager');
require('../global-hooks');

var paymentMethod = 'bitcoinTestnet';

describe('paymentMethods.' + paymentMethod, function() {

	describe('deriveAddress(extendedPublicKey, derivationScheme, index, cb)', function() {

		var fn = 'app.paymentMethods.' +  paymentMethod + '.deriveAddress';
		var isAsync = true;

		var tests = [
			{
				description: 'bitcoinTestnet (legacy)',
				extendedPublicKey: 'tpubDD8itYXaDtaTuuouxqdvxfYthFvs8xNbheGxwEcGXJyxrzuyMAxv4xbsw96kz4wKLjSyn3Dd8gbB7kF1bdJdphz1ZA9Wf1Vbgrm3tTZVqSs',
				derivationScheme: 'm/0/n',
				addresses: [
					'mocgFTsFarDc6ACyso8xhAbKjtfGYW42UY',
					'mhgMkiZiqCmqDaT8b3E6uUD5xmvoKJEBpx',
					'mhFjbjmLHRF38WBhUfgQD78u8puETQbMVK',
				],
			},
		];

		var samples = [];
		_.each(tests, function(test) {
			_.each(test.addresses, function(address, index) {
				var sample = {
					description: test.description + ' (' + index + ')',
					args: [
						test.extendedPublicKey,
						test.derivationScheme,
						index,
					],
					result: address,
				};
				samples.push(sample);
			});
		});

		_.each(samples, function(sample) {

			it(sample.description, function(done) {

				var evaluateOptions = {
					fn: fn,
					isAsync: isAsync,
					args: sample.args,
				};

				manager.evaluateFn(evaluateOptions, function(error, result) {
					if (error) return done(error);
					expect(result).to.equal(sample.result);
					done();
				});
			});
		});
	});
});

