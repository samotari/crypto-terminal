'use strict';

var _ = require('underscore');
var async = require('async');
var querystring = require('querystring');

var helpers = require('../../helpers');
var manager = require('../../../manager');
require('../../global-hooks');

describe('#payment-status [bitcoin]', function() {

	beforeEach(function(done) {
		manager.evaluateInPageContext(function() {
			app.markGettingStartedAsComplete();
			app.settings.set('configurableCryptoCurrencies', ['bitcoinTestnet']);
			app.settings.set('bitcoinTestnet.extendedPublicKey', 'vpub5UG3QqhKbZ8bL7PNw6om29xk7Bhm6BhtCwoYhF8MF5aF1s843gPFjVqQn5kS43dArrzkr8jwKbLCAt3dkpkkjd8VmuRwwmmRK4PMTtTjnNJ');
			app.settings.set('displayCurrency', 'BTC');
		}, done);
	});

	var client;
	beforeEach(function(done) {
		manager.connectElectrumClient('bitcoinTestnet', ['127.0.0.1 t51001'], function(error, socket) {
			if (error) return done(error);
			client = socket;
			done();
		});
	});

	beforeEach(function(done) {
		manager.evaluateInPageContext(function() {
			// Reset the address index so that the same address is used for each test.
			app.settings.set('bitcoinTestnet.addressIndex', '10');
		}, done);
	});

	beforeEach(function(done) {
		manager.navigate('/#pay', done);
	});

	beforeEach(function(done) {
		helpers['#pay'].setAmount('0.000075', done);
	});

	it('accepts payment when a tx with sufficient value is received', function(done) {
		// var address = 'tb1quz62r3kq655w46fq32a45vsej5vmh8smrhr5xd';
		var tx = {
			fees: 345,
			height: 1573756,
			hex: '02000000000104703434de81887b5dd5b37d3815b2d214f77ad24f9022971ca8b713411cc5a7160000000000feffffff97e192135991459047b0c897724c6ceb1fe12ce334cc23bcd8f03aed84425fae0100000000feffffffb55396dfd187f996b008c19fd024cb565be56cc9f878c1148c523ca67a22b6df0100000000feffffff52093f5c7a7d455692adff8e1e86ebc069a8e6275b8384133644953583c386f00100000000feffffff02611c000000000000160014d9eb8b4b52d5f827277739a46c11c4a5f5a97649d81d000000000000160014e0b4a1c6c0d528eae9208abb5a32199519bb9e1b02473044022005af9cadc3ed33e8d045be0ea9a8a39b078578871348a1cf09d20882402fd2f402204b1ff8776f2f6187f483732a59a07068a77776160c3b8381450e4653fa93336a01210250c0b914a6d336cc94caf5dbefeb0c43aeaa946f6fa5fb771cf5457a0278aafc02473044022050fce8eea466d0f2e9b896575d32aba4f99271d861596dec2a5244636bedcf9702207b948de9b8a054e93bd3ad395166341a5890adb47d76e82f9f438640738333910121039905f4205974e81fb1f6144f15712ede93b14fd23b74d35417d111e92bd50d4d024730440220504bf42aa358d9ae9e8e2cadef17d8ecba7a2bfe6d966619ac18aa03bf07ec4002202c4994aad21e6d9fbd7f7fd244a69174d337afd67db2869e3463afc555d17b0801210250c0b914a6d336cc94caf5dbefeb0c43aeaa946f6fa5fb771cf5457a0278aafc02473044022003a150088894435eae0d727c71a98ab3d321f953de8d79030980d0c7b6aeb1710220644c2a44208c42fb45982980cf2437087ac428168af50c4a7ff63bcdd651bda70121039905f4205974e81fb1f6144f15712ede93b14fd23b74d35417d111e92bd50d4d7b031800',
			tx_hash: '5596b5e33ab5d706250290bbbb7b7508b6a1f575990942aec99454dadef9ebcc',
		};
		manager.socketServer.mock.receiveTx(client, tx, _.noop);
		helpers['#pay'].continue(function(error) {
			if (error) return done(error);
			manager.page.waitFor('.view.payment-status.unconfirmed').then(function() {
				manager.page.waitFor('.result-indicator').then(function() {
					done();
				}).catch(done);
			}).catch(done);
		});
	});

	it('times-out if no tx is received', function(done) {
		helpers['#pay'].continue(function(error) {
			if (error) return done(error);
			manager.evaluateInPageContext(function() {
				app.config.paymentRequests.timeout = 80;
			}, function(error) {
				if (error) return done(error);
				manager.page.waitFor('.view.payment-status.timed-out').then(function() {
					done();
				}).catch(done);
			});
		});
	});
});
