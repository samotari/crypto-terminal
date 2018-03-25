var _ = require('underscore');
var expect = require('chai').expect;
var manager = require('../manager');

describe('paymentMethods.bitcoinTestnet', function() {

	describe('deriveAddress(extendedPublicKey, derivationScheme, index, cb)', function() {

		it('should derive child public keys correctly', function(done) {

			var extendedPublicKey = 'tpubDD8itYXaDtaTuuouxqdvxfYthFvs8xNbheGxwEcGXJyxrzuyMAxv4xbsw96kz4wKLjSyn3Dd8gbB7kF1bdJdphz1ZA9Wf1Vbgrm3tTZVqSs';
			var derivationScheme = 'm/0/n';
			var addresses = [
				'mocgFTsFarDc6ACyso8xhAbKjtfGYW42UY',
				'mhgMkiZiqCmqDaT8b3E6uUD5xmvoKJEBpx',
				'mhFjbjmLHRF38WBhUfgQD78u8puETQbMVK',
				'mzRWbz978c9rby3MKagaLaHF2Xy6dnFrqc',
				'mkuo1gQdARMoxJJM612ZdLPXk2ht4sS79y',
			];

			manager.page.evaluate(function(extendedPublicKey, derivationScheme, n) {
				return new Promise(function(resolve, reject) {
					async.times(n, function(index, next) {
						app.paymentMethods.bitcoinTestnet.deriveAddress(
							extendedPublicKey,
							derivationScheme,
							index,
							next
						);
					}, function(error, results) {
						if (error) return reject(error);
						resolve(results);
					});
				});
			}, extendedPublicKey, derivationScheme, addresses.length)
			.then(function(results) {
				_.each(addresses, function(address, index) {
					expect(results[index]).to.equal(addresses[index]);
				});
				done();
			})
			.catch(done);
		});
	});
});
