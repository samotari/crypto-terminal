'use strict';

var _ = require('underscore');
var expect = require('chai').expect;
var manager = require('../../manager');
require('../global-hooks');

var samples = [
	{
		description: 'bitcoin (legacy)',
		paymentMethod: 'bitcoin',
		extendedPublicKey: 'xpub69V9b3wdTWG6Xjtpz5dX8ULpqLKzci3o7YCb6xQUpHAhf3dzFBNeM4GXTSBff82Zh524oHpSPY4XimQMCbxAsprrh7GmCNpp9GNdrHxxqJo',
		derivationScheme: 'm/0/n',
		addresses: [
			'1HimLJR4GFfdU9UBHHzqnYRRqbd6MjzXjd',
			'1MhAEL338heVJpdwqgdNFXYNrEcqttrZdM',
			'1DVosAcKnPz2xDPFBKqZ34FQ5cCuKGW45H',
			'1FMAadsP35aAF3x6vPJZ4Nt1iWiBUeT7eg',
			'1NoPDCGugg4R9U4QqTJiMmuxFuxY8xo8WZ'
		],
	},
	{
		description: 'bitcoin (segwit backwards compatible)',
		paymentMethod: 'bitcoin',
		extendedPublicKey: 'ypub6aF3kr3WGbpBBEUnY5WXhkE8581B8LH36No7fTzLrNBTEB2n5fLEjEUwPd8QqLppdS2dWdhULB5q4xp9Ter3iivhUaYuu4m3zmmVQvvwnTX',
		derivationScheme: 'm/0/n',
		addresses: [
			'33eChXmatbM1Nr2VePjXjFELgUst74cQbu',
			'3QjcYPENrAcKBpA2iUvGVyFy1akXd3iZtR',
			'3HtYP1GXMG8VfkdAA2dJSVeaM3mKnWbMZn',
			'3QMRz55S19so5txEACnaeA4Uw2VT4JNv4q',
			'3BGCkmVUD4VUAefFQY6hrGst4NaM8TAKpS',
		],
	},
	{
		description: 'bitcoin (segwit native)',
		paymentMethod: 'bitcoin',
		extendedPublicKey: 'zpub6nSMKo6UR99G6XXJ7iYsucu1ACtk8MZ8ZDhpWmgk99dRKZCs98qyVkFFtg44n9xozaQ5NHLNK21sxTSPqbF9kHX9XiCwep3q8jcN5VD91Yx',
		derivationScheme: 'm/0/n',
		addresses: [
			'bc1qwrkr2f92sff834f84vkztw277nlu5sd0lsh86d',
			'bc1qm9kch8m8s27zn57aerr8kcs2uj7ue5uqgdy3sn',
			'bc1qxtp2l28e66c722qnraynya22tuxgh50xh7dy3x',
			'bc1qfas87ry46hmh2a0r2wqavu2hx6tg3yk0v4x4s2',
			'bc1qkw75k5uqnypx4tk5xnlkyrf8qdnw4rydwte9uj',
		],
	},
	{
		description: 'litecoin (legacy)',
		paymentMethod: 'litecoin',
		extendedPublicKey: 'xpub661MyMwAqRbcEsEC246xJ7246A9KQRSGYe4CEqiXHLcFcFCnGF5q8NNC3JsCUASVMMxQMBp8SjYCEBA94vMoXKVz5LUtZaq4X7yuxDAxa7s',
		derivationScheme: 'm/0/n',
		addresses: [
			'LcEcZE8cYfvaLTy12UVnDcnfaGam17BTia',
			'LNWgzSCCrDnbCEFA6mvDeBdcqRep4n2had',
			'LSK2Uh51r6MNfC25YXKdu57PpQitta4fCH',
			'LWEEuoWv8TKV9C3wEzgCgigwYxuY77rGYY',
			'LMoCD6pBiqMnTaDTkLh76wPm5evdLgBRQ3',
		],
	},
	{
		description: 'litecoin (segwit backwards compatible)',
		paymentMethod: 'litecoin',
		extendedPublicKey: 'ypub6WVbiJsEPVGWBXUwKUXU9Wq354c2mkkehpqpjerAkziizWRAK4u43RMLHXEUXG2R9ECmmqj28472xzXYsrEaWCrmFRnZVCRs6ePZaAhT1Pw',
		derivationScheme: 'm/0/n',
		addresses: [
			'MJNP9yd5LEJUoghp1TnBMybtmrijFQmJkf',
			'M9M1zsXe9wryrtGoCtgCmxQ8zsarDvfwQx',
			'MRDoyLZs8N9KymijePEqK2WCN2oLth9vTw',
			'MC8cEwrT2v4aaVRiFwgfgK2rPtVLCxKsCK',
			'MCNRknJ2MbTq6AH9cjJ76Qq4Ev7V8UP2Hv',
		],
	},
	{
		description: 'litecoin (segwit native)',
		paymentMethod: 'litecoin',
		extendedPublicKey: 'zpub6niGDHLYYhteGe8TWHbDaTNTyqR2MaQAe2tbMqJofkZ5X9J7beigZBZrvZAV2M84BwYZKZYmZjuGvku952DunnrzuFEqErqE5i688dSuisG',
		derivationScheme: 'm/0/n',
		addresses: [
			'ltc1q5dkcl29xhpjgdepcpvcecv4kj2h6j4964a6vsc',
			'ltc1qy4s7lyd6e4lmvuyfagy32k23knx7dxc980gsmq',
			'ltc1qpsyqs02tayf93vwp5teghhm5evff7src3vlhmc',
			'ltc1qds3rxjs0389h06uaxw0f394tny3thagsshqn9t',
			'ltc1q5qpsuvnch8hfdmc462mejhqua2kazfxf0rtvhx',
		],
	},
	{
		description: 'bitcoinTestnet (legacy)',
		paymentMethod: 'bitcoinTestnet',
		extendedPublicKey: 'tpubDD8itYXaDtaTuuouxqdvxfYthFvs8xNbheGxwEcGXJyxrzuyMAxv4xbsw96kz4wKLjSyn3Dd8gbB7kF1bdJdphz1ZA9Wf1Vbgrm3tTZVqSs',
		derivationScheme: 'm/0/n',
		addresses: [
			'mocgFTsFarDc6ACyso8xhAbKjtfGYW42UY',
			'mhgMkiZiqCmqDaT8b3E6uUD5xmvoKJEBpx',
			'mhFjbjmLHRF38WBhUfgQD78u8puETQbMVK',
			'mzRWbz978c9rby3MKagaLaHF2Xy6dnFrqc',
			'mkuo1gQdARMoxJJM612ZdLPXk2ht4sS79y',
		],
	},
];

_.each(samples, function(sample) {

	var paymentMethod = sample.paymentMethod;

	describe(sample.description, function() {

		describe('deriveAddress(extendedPublicKey, derivationScheme, index, cb)', function() {

			it('should derive child public keys correctly', function(done) {

				var extendedPublicKey = sample.extendedPublicKey;
				var derivationScheme = sample.derivationScheme;
				var addresses = sample.addresses;

				manager.page.evaluate(function(paymentMethod, extendedPublicKey, derivationScheme, n) {
					return new Promise(function(resolve, reject) {
						async.times(n, function(index, next) {
							app.paymentMethods[paymentMethod].deriveAddress(
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
				}, paymentMethod, extendedPublicKey, derivationScheme, addresses.length)
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
});
