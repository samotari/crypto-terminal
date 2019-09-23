'use strict';

var manager = require('../manager');
require('../global-hooks');

before(function(done) {
	manager.preparePage(done);
});

before(function(done) {
	manager.onAppLoaded(done);
});

before(function(done) {
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
		app.config.debug = true;
		app.initializeElectrumServices();
	}, done);
});

before(function(done) {
	manager.navigate('/', done);
});
