describe('paymentMethods.bitcoinTestnet', function() {

	describe('deriveAddress(extendedPublicKey, addressIndex)', function() {

		it('should exist', function() {
			expect(app.paymentMethods.bitcoinTestnet.deriveAddress).to.be.a('function');
		});

		it('should derive child public keys correctly', function() {
			var extendedPublicKey = 'tpubDD8itYXaDtaTuuouxqdvxfYthFvs8xNbheGxwEcGXJyxrzuyMAxv4xbsw96kz4wKLjSyn3Dd8gbB7kF1bdJdphz1ZA9Wf1Vbgrm3tTZVqSs';
			var addresses = [
				'mocgFTsFarDc6ACyso8xhAbKjtfGYW42UY',
				'mhgMkiZiqCmqDaT8b3E6uUD5xmvoKJEBpx',
				'mhFjbjmLHRF38WBhUfgQD78u8puETQbMVK',
				'mzRWbz978c9rby3MKagaLaHF2Xy6dnFrqc',
				'mkuo1gQdARMoxJJM612ZdLPXk2ht4sS79y',
			];
			var address;
			for (var index = 0; index < addresses.length; index++) {
				address = app.paymentMethods.bitcoinTestnet.deriveAddress(extendedPublicKey, index);
				expect(address).to.equal(addresses[index]);
			}
		});
	});
});
