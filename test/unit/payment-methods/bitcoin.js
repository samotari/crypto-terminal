'use strict';

var _ = require('underscore');
var expect = require('chai').expect;
var manager = require('../../manager');
require('../global-hooks');

var paymentMethod = 'bitcoin';

describe('paymentMethods.' + paymentMethod, function() {

	describe('deriveAddress(extendedPublicKey, derivationScheme, index, cb)', function() {

		var fn = 'app.paymentMethods.' +  paymentMethod + '.deriveAddress';
		var isAsync = true;

		var tests = [
			{
				description: 'xpub: bitcoin (legacy)',
				extendedPublicKey: 'xpub69V9b3wdTWG6Xjtpz5dX8ULpqLKzci3o7YCb6xQUpHAhf3dzFBNeM4GXTSBff82Zh524oHpSPY4XimQMCbxAsprrh7GmCNpp9GNdrHxxqJo',
				derivationScheme: 'm/0/n',
				addresses: [
					'1HimLJR4GFfdU9UBHHzqnYRRqbd6MjzXjd',
					'1MhAEL338heVJpdwqgdNFXYNrEcqttrZdM',
					'1DVosAcKnPz2xDPFBKqZ34FQ5cCuKGW45H',
				],
			},
			{
				description: 'ypub: bitcoin (segwit backwards compatible)',
				extendedPublicKey: 'ypub6aF3kr3WGbpBBEUnY5WXhkE8581B8LH36No7fTzLrNBTEB2n5fLEjEUwPd8QqLppdS2dWdhULB5q4xp9Ter3iivhUaYuu4m3zmmVQvvwnTX',
				derivationScheme: 'm/0/n',
				addresses: [
					'33eChXmatbM1Nr2VePjXjFELgUst74cQbu',
					'3QjcYPENrAcKBpA2iUvGVyFy1akXd3iZtR',
					'3HtYP1GXMG8VfkdAA2dJSVeaM3mKnWbMZn',
				],
			},
			{
				description: 'zpub: bitcoin (segwit native)',
				extendedPublicKey: 'zpub6nSMKo6UR99G6XXJ7iYsucu1ACtk8MZ8ZDhpWmgk99dRKZCs98qyVkFFtg44n9xozaQ5NHLNK21sxTSPqbF9kHX9XiCwep3q8jcN5VD91Yx',
				derivationScheme: 'm/0/n',
				addresses: [
					'bc1qwrkr2f92sff834f84vkztw277nlu5sd0lsh86d',
					'bc1qm9kch8m8s27zn57aerr8kcs2uj7ue5uqgdy3sn',
					'bc1qxtp2l28e66c722qnraynya22tuxgh50xh7dy3x',
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

	describe('toBaseUnit(value)', function() {

		var fn = 'app.paymentMethods.' + paymentMethod + '.toBaseUnit';
		var isAsync = false;

		var samples = [
			{
				description: '1 satoshi',
				args: [1e-8],
				result: 1,
			},
		];

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
