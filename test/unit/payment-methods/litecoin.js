'use strict';

var _ = require('underscore');
var expect = require('chai').expect;
var manager = require('../../manager');
require('../global-hooks');

var paymentMethod = 'litecoin';

describe('paymentMethods.' + paymentMethod, function() {

	describe('deriveAddress(extendedPublicKey, derivationScheme, index, cb)', function() {

		var fn = 'app.paymentMethods.' +  paymentMethod + '.deriveAddress';
		var isAsync = true;

		var tests = [
			{
				description: 'litecoin (legacy)',
				extendedPublicKey: 'xpub661MyMwAqRbcEsEC246xJ7246A9KQRSGYe4CEqiXHLcFcFCnGF5q8NNC3JsCUASVMMxQMBp8SjYCEBA94vMoXKVz5LUtZaq4X7yuxDAxa7s',
				derivationScheme: 'm/0/n',
				addresses: [
					'LcEcZE8cYfvaLTy12UVnDcnfaGam17BTia',
					'LNWgzSCCrDnbCEFA6mvDeBdcqRep4n2had',
					'LSK2Uh51r6MNfC25YXKdu57PpQitta4fCH',
				],
			},
			{
				description: 'litecoin (segwit backwards compatible)',
				extendedPublicKey: 'ypub6WVbiJsEPVGWBXUwKUXU9Wq354c2mkkehpqpjerAkziizWRAK4u43RMLHXEUXG2R9ECmmqj28472xzXYsrEaWCrmFRnZVCRs6ePZaAhT1Pw',
				derivationScheme: 'm/0/n',
				addresses: [
					'MJNP9yd5LEJUoghp1TnBMybtmrijFQmJkf',
					'M9M1zsXe9wryrtGoCtgCmxQ8zsarDvfwQx',
					'MRDoyLZs8N9KymijePEqK2WCN2oLth9vTw',
				],
			},
			{
				description: 'litecoin (segwit native)',
				extendedPublicKey: 'zpub6niGDHLYYhteGe8TWHbDaTNTyqR2MaQAe2tbMqJofkZ5X9J7beigZBZrvZAV2M84BwYZKZYmZjuGvku952DunnrzuFEqErqE5i688dSuisG',
				derivationScheme: 'm/0/n',
				addresses: [
					'ltc1q5dkcl29xhpjgdepcpvcecv4kj2h6j4964a6vsc',
					'ltc1qy4s7lyd6e4lmvuyfagy32k23knx7dxc980gsmq',
					'ltc1qpsyqs02tayf93vwp5teghhm5evff7src3vlhmc',
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
