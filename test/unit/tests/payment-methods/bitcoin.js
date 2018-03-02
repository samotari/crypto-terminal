describe('Payment Method: Bitcoin', function() {

	it('prepareHDNodeInstance should return an object', function() {

		 var xpub = 'tpubDD8itYXaDtaTuuouxqdvxfYthFvs8xNbheGxwEcGXJyxrzuyMAxv4xbsw96kz4wKLjSyn3Dd8gbB7kF1bdJdphz1ZA9Wf1Vbgrm3tTZVqSs';

		 var hDNodeInstance = app.paymentMethods.bitcoin.prepareHDNodeInstance(xpub);
		expect(hDNodeInstance).to.be.an('object');
	});
});
