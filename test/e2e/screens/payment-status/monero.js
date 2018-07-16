'use strict';

var _ = require('underscore');
var helpers = require('../../helpers');
var manager = require('../../../manager');
var querystring = require('querystring');
require('../../global-hooks');

describe('#payment-status [monero]', function () {

	var server;	
	before(function () {
		server = manager.socketServer();
		server.tmpApp.use(function(req, res, next) {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "*");
			next();
		});
		server.tmpApp.get('/api/v1/monero/outputs', function (req, res, next) {
			res.send({ "data": { "address": "6adfb2d2cb94ed7ffd946f4a069c6477f4e31045a5762c84017e5e1b984c714ce89dea83b23fd6c4c097aa72df79a137b4dbdba913334bb6dec84f4f5823ae7c", "outputs": [{ "amount": 10000000000, "match": false, "output_idx": 0, "output_pubkey": "08e84419b8fc122795fd93af6706677ad96bfa562e82aa6ea416a3a483a86605" }, { "amount": 70000000000, "match": true, "output_idx": 1, "output_pubkey": "765383137d77847e2565bbcc59e10bfeafbe2c16e13b55e00c82db76cc632838" }, { "amount": 300000000000, "match": true, "output_idx": 2, "output_pubkey": "03a945dd210b1420f7c49ae8a96afab25a44e0568bb670249976ea6ab3d62d8f" }, { "amount": 700000000000, "match": true, "output_idx": 3, "output_pubkey": "4b39d84508723ab02a5865016120e103941e9fd2a6601b4cc781af76ef93fe16" }, { "amount": 2000000000000, "true": false, "output_idx": 4, "output_pubkey": "386b13daad771021f503003e454a8b1c7cc3ffbbb6dbcc92d78ceebd2ae7a385" }, { "amount": 7000000000000, "match": true, "output_idx": 5, "output_pubkey": "2c3e79a1a6bfcebfe347dff499800695c0cb6ee4ccb219e3201849ca8a2d9005" }], "tx_hash": "a5e50d89d4261036faf3d6d32f321e71ec8d810c64f268f321a3fe0cf8ee7968", "tx_prove": false, "viewkey": "52aa4c69b93b780885c9d7f51e6fd5795904962c61a2e07437e130784846f70d" }, "status": "success" });
		})
	})


	beforeEach(function (done) {
		manager.onAppLoaded(done);
	});

	beforeEach(function () {
		server.primus.write({
			channel: 'exchange-rates',
			data: { 'BTC': 1.00000000, 'CZK': 142155.31, 'EUR': 5467.50, 'LTC': 77.85130401, 'USD': 6389.06, 'XMR': 49.66476285075738763347 },
		});
	});

	beforeEach(function (done) {
		manager.evaluateInPageContext(function () {
			app.settings.set('configurableCryptoCurrencies', ['monero']);
			app.settings.set('monero.publicAddress', '9xmkWjzAB8JguD7JvkJxPHgMwkf7VP5v3Z5eSNmRMdoeCEnoVu6eGUbZT3FQ3Q8XrGihNEbb4qGhqHHGK5kWy9chU3URbaF');
			app.settings.set('monero.privateViewKey', '136674e3e6868bb04d4ef2674f97c00166f5f7aa67185bdda97cde8ecfe4f609');
			app.settings.set('displayCurrency', 'EUR');
		}, done);
	});

	beforeEach(function (done) {
		manager.navigate('/#pay', done);
	});

	beforeEach(function (done) {
		var pressNumberPadKey = helpers['#pay'].pressNumberPadKey;
		pressNumberPadKey('1').then(function () {
			manager.page.click('.button.continue').then(function () {
				manager.page.waitFor('.view.choose-payment-method .button.payment-method.monero').then(function () {
					helpers['#choose-payment-method'].selectPaymentMethod('monero').then(function () {
						done();
					})
				}).catch(done);
			}).catch(done);
		}).catch(done);
	});

	afterEach(function () {
		server.close();
	});

	describe('unconfirmed', function () {
		it('should accept payment', function (done) {
			manager.page.waitFor('.address-qr-code').then(function () {

				var channel = 'get-monero-transactions?' + querystring.stringify({
					networkName: 'testnet',
				});

				manager.page.waitFor(function (channel) {
					return new Promise(function (resolve, reject) {
						try {
							async.until(function () {
								var appIsSubscribed = app.services.ctApi.isSubscribed(channel);
								return appIsSubscribed;
							}, function (next) {
								_.delay(next, 5);
							}, function () {
								resolve(true);
							});
						} catch (error) {
							return reject(error);
						}
					});
				}, {}/* options */, channel).then(function() {
					// Take paymentRequest in order to use paymentId that is randomly generated.
					manager.page.evaluate(function() {
						var paymentRequest = app.paymentRequests.findWhere({ status: 'pending' }).attributes;
						return paymentRequest;
					}).then(function(results) {
						var paymentId = results.data.paymentId;
						server.primus.write({
							channel: channel,
							data: [
								{
									payment_id: paymentId,
								}
							]
						});
						manager.page.waitFor('.view.payment-status.unconfirmed').then(function () {
							manager.page.waitFor('.result-indicator').then(function () {
								done();
							}).catch(done);
						}).catch(done);
					}).catch(done);
				}).catch(done);
			}).catch(done);
		});
	});
});
