'use strict';

var manager = require('../manager');
require('../global-hooks');

beforeEach(function() {
	manager.socketServer = manager.electrumServer(51001/* port */);
});

beforeEach(function(done) {
	manager.preparePage(done);
});

beforeEach(function(done) {
	manager.onAppLoaded(done);
});

beforeEach(function(done) {
	manager.evaluateInPageContext(function() {
		app.abstracts.ElectrumService.prototype.defaultOptions.saveBadPeers = false;
		app.abstracts.ElectrumService.prototype.defaultOptions.cmd.timeout = 20;
		app.abstracts.JsonRpcTcpSocketClient.prototype.defaultOptions.autoReconnect = false;
		_.each(app.paymentMethods, function(paymentMethod, key) {
			if (paymentMethod.electrum) {
				app.paymentMethods[key].electrum.servers = [];
			}
		});
		app.setDeveloperMode(true);
		app.settings.set('debug', true);
		app.initializeElectrumServices();
	}, done);
});

afterEach(function(done) {
	manager.page.close().then(function() {
		done();
	}).catch(done);
});

afterEach(function(done) {
	manager.socketServer.close(done);
});
