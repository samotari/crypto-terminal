var _ = require('underscore');
var expect = require('chai').expect;
var manager = require('../manager');

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
});
