'use strict';

var _ = require('underscore');
var expect = require('chai').expect;
var manager = require('../../manager');
require('../global-hooks');

describe('paymentMethods.monero', function() {

	describe('convertAddressToHex(address)', function() {

		it('should convert an address to hexadecimal', function(done) {

			var fixtures = [
				// testnet:
				{
					address: '9u6wW37iWHtVfJCkhMVpzJWYAh7edvWRzCHYRyJV7L4uMDmjzZnzgP4KyPViRwscshaJnsr4wuFSqUTxVjcqVstgEpEmbXy',
					hex: '3533169ab80f642fab59417ac41c3677b097a4e1a6a5efe54378470a0addd9de78e37f00b25d8973716d69f590290fd8c720c4320fe2da72a4337e677cc2f47d7a71f0581c',
				},
				// mainnet:
				{
					address: '46tMx8DRN19UBHxkwsuWjghDT7yC4TVVS9VJMft5NMUqXMruNgCJeSMWeFfn7TgRrv4urbHRaJZzDemjqKbDTaJ496DL1dF',
					hex: '128ae1b0fdfe069ca27bbf932b79a1fff06d8106d9c4428132bef65996ac1e06b58230f8d53479eab1383d0ed51c446717625415b85d322ee1d1f68519ad181147b47df40e',
				},
				// integrated:
				{
					address: '4Gb2xw2uyGfUBHxkwsuWjghDT7yC4TVVS9VJMft5NMUqXMruNgCJeSMWeFfn7TgRrv4urbHRaJZzDemjqKbDTaJ4Cur4b5jLQaU3cZnBvN',
					hex: '138ae1b0fdfe069ca27bbf932b79a1fff06d8106d9c4428132bef65996ac1e06b58230f8d53479eab1383d0ed51c446717625415b85d322ee1d1f68519ad181147364797cdafbae9172984cbe7',
				},
			];

			manager.page.evaluate(function(fixtures) {
				var results = [];
				var index, result, fixture;
				for (index = 0; index < fixtures.length; index++) {
					fixture = fixtures[index];
					result = app.paymentMethods.monero.convertAddressToHex(fixture.address);
					results.push(result);
				}
				return results;
			}, fixtures)
				.then(function(results) {
					expect(results).to.have.length(fixtures.length);
					_.each(fixtures, function(fixture, index) {
						var result = results[index];
						expect(result).to.equal(fixture.hex);
					});
					done();
				})
				.catch(done);
		});
	});

	describe('decodePublicAddress(publicAddress)', function() {

		it('should decode public address correctly', function(done) {
			var fixtures = [
				// testnet:
				{
					publicAddress: '9u6wW37iWHtVfJCkhMVpzJWYAh7edvWRzCHYRyJV7L4uMDmjzZnzgP4KyPViRwscshaJnsr4wuFSqUTxVjcqVstgEpEmbXy',
					decoded: {
						publicSpendKey: '33169ab80f642fab59417ac41c3677b097a4e1a6a5efe54378470a0addd9de78',
						publicViewKey: 'e37f00b25d8973716d69f590290fd8c720c4320fe2da72a4337e677cc2f47d7a',
						paymentId: null,
					},
				},
				// mainnet:
				{
					publicAddress: '46tMx8DRN19UBHxkwsuWjghDT7yC4TVVS9VJMft5NMUqXMruNgCJeSMWeFfn7TgRrv4urbHRaJZzDemjqKbDTaJ496DL1dF',
					decoded: {
						publicSpendKey: '8ae1b0fdfe069ca27bbf932b79a1fff06d8106d9c4428132bef65996ac1e06b5',
						publicViewKey: '8230f8d53479eab1383d0ed51c446717625415b85d322ee1d1f68519ad181147',
						paymentId: null,
					},
				},
				// integrated:
				{
					publicAddress: '4Gb2xw2uyGfUBHxkwsuWjghDT7yC4TVVS9VJMft5NMUqXMruNgCJeSMWeFfn7TgRrv4urbHRaJZzDemjqKbDTaJ4Cur4b5jLQaU3cZnBvN',
					decoded: {
						publicSpendKey: '8ae1b0fdfe069ca27bbf932b79a1fff06d8106d9c4428132bef65996ac1e06b5',
						publicViewKey: '8230f8d53479eab1383d0ed51c446717625415b85d322ee1d1f68519ad181147',
						paymentId: '364797cdafbae917',
					},
				},
			];

			manager.page.evaluate(function(fixtures) {
				var results = [];
				var index, result, fixture;
				for (index = 0; index < fixtures.length; index++) {
					fixture = fixtures[index];
					result = app.paymentMethods.monero.decodePublicAddress(fixture.publicAddress);
					results.push(result);
				}
				return results;
			}, fixtures)
				.then(function(results) {
					expect(results).to.have.length(fixtures.length);
					_.each(fixtures, function(fixture, index) {
						var result = results[index];
						result = _.pick(result, _.keys(fixture.decoded));
						expect(result).to.deep.equal(fixture.decoded);
					});
					done();
				})
				.catch(done);
		});
	});

	describe('secretKeyToPublicKey(secretKey)', function() {

		it('should derive the public key correctly', function(done) {

			var fixtures = [
				{
					secretKey: '136674e3e6868bb04d4ef2674f97c00166f5f7aa67185bdda97cde8ecfe4f609',
					publicKey: '2fa6a37e5095f4c1ffe34726694ce9f948adc587dc224c6155905c58eeaba6ef',
				},
				{
					secretKey: '2cc9626dc6647c96c93e1714036a696b75472c38a6aef56df4d7903782531603',
					publicKey: '0cc13af67c5546628fc7b507758be423572db4ad2bc8a274c07bb2c7b3272a52',
				},
				{
					secretKey: '5e00fe01b4b16c2a29ba043379238d3bad90ce2840aae5e873d761b6eaf7fc08',
					publicKey: '672d72b1dc13010d91d85833858191198c1be5b440f2721813458a0d99f98d3e',
				},
			];

			manager.page.evaluate(function(fixtures) {
				return _.map(fixtures, function(fixture) {
					return app.paymentMethods.monero.secretKeyToPublicKey(fixture.secretKey);
				});
			}, fixtures)
				.then(function(results) {
					expect(results).to.have.length(fixtures.length);
					_.each(fixtures, function(fixture, index) {
						var result = results[index];
						expect(result).to.equal(fixture.publicKey);
					});
					done();
				})
				.catch(done);
		});
	});
});
