var expect = require('chai').expect;
var manager = require('../manager');

describe('paymentMethods.bitcoinTestnet', function () {

	it('should derive child public keys correctly', function (done) {
	
		manager.page.evaluate(function() {
			/**
				This runs in the browser context.
			*/

			var extendedPublicKey = 'tpubDD8itYXaDtaTuuouxqdvxfYthFvs8xNbheGxwEcGXJyxrzuyMAxv4xbsw96kz4wKLjSyn3Dd8gbB7kF1bdJdphz1ZA9Wf1Vbgrm3tTZVqSs';

			var response = [];
			for (var index = 0; index < 5; index++) {
				response.push(app.paymentMethods.bitcoinTestnet.deriveAddress(extendedPublicKey, index));
			}
			return response;
		})
		.then(function(results) {
			var addresses = [
				'mocgFTsFarDc6ACyso8xhAbKjtfGYW42UY',
				'mhgMkiZiqCmqDaT8b3E6uUD5xmvoKJEBpx',
				'mhFjbjmLHRF38WBhUfgQD78u8puETQbMVK',
				'mzRWbz978c9rby3MKagaLaHF2Xy6dnFrqc',
				'mkuo1gQdARMoxJJM612ZdLPXk2ht4sS79y',
			];

			for (var index = 0; index < addresses.length; index++) {
				expect(results[index]).to.equal(addresses[index]);
			}

			done();
		})
	}).timeout(5000);
});	