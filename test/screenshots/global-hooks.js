var _ = require('underscore');
var manager = require('../manager');
require('../global-hooks');

beforeEach(function() {
	manager.socketServer = manager.electrumServer(51001/* port */);
});

beforeEach(function(done) {
	manager.preparePage(done);
});

beforeEach(function(done) {
	manager.page.setViewport({
		width: 375,
		height: 667,
	}).then(function() {
		done();
	}).catch(done);
});

beforeEach(function(done) {
	manager.onAppLoaded(done);
});

beforeEach(function(done) {
	manager.evaluateInPageContext(function() {
		app.abstracts.ElectrumService.prototype.defaultOptions.saveBadPeers = false;
		app.abstracts.ElectrumService.prototype.defaultOptions.cmd.timeout = 100;
		app.abstracts.JsonRpcTcpSocketClient.prototype.defaultOptions.autoReconnect = false;
		_.each(app.paymentMethods, function(paymentMethod, key) {
			if (paymentMethod.electrum) {
				app.paymentMethods[key].electrum.servers = [];
			}
		});
		app.setDeveloperMode(true);
		app.config.debug = true;
		app.markGettingStartedAsComplete();
		// Must configure more than one payment method to be able to view the #choose-payment-method screen.
		app.settings.set('configurableCryptoCurrencies', ['bitcoin', 'bitcoinTestnet']);
		app.settings.set('bitcoin.extendedPublicKey', 'xpub69V9b3wdTWG6Xjtpz5dX8ULpqLKzci3o7YCb6xQUpHAhf3dzFBNeM4GXTSBff82Zh524oHpSPY4XimQMCbxAsprrh7GmCNpp9GNdrHxxqJo');
		app.settings.set('bitcoinTestnet.extendedPublicKey', 'vpub5UG3QqhKbZ8bL7PNw6om29xk7Bhm6BhtCwoYhF8MF5aF1s843gPFjVqQn5kS43dArrzkr8jwKbLCAt3dkpkkjd8VmuRwwmmRK4PMTtTjnNJ');
		// Reset the address index so that the same address is used for each test.
		app.settings.set('bitcoinTestnet.addressIndex', '10');
		app.settings.set('displayCurrency', 'EUR');
		app.config.paymentRequests.saveDelay = 0;
		app.initializeElectrumServices({ force: true });
	}, done);
});

beforeEach(function(done) {
	manager.connectElectrumClient('bitcoinTestnet', ['127.0.0.1 t51001'], function(error, socket) {
		if (error) return done(error);
		this.client = socket;
		done();
	});
});

afterEach(function(done) {
	var name = this.currentTest.title.replace(/ /g, '-');
	manager.screenshot(name, done);
});

afterEach(function(done) {
	manager.page.close().then(function() {
		done();
	}).catch(done);
});

afterEach(function(done) {
	_.invoke(manager.socketServer.sockets, 'terminate');
	manager.socketServer.sockets = [];
	manager.socketServer.close(done);
});
