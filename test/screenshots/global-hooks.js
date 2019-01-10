var manager = require('../manager');
require('../global-hooks');

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

var socketServer;
beforeEach(function() {
	socketServer = manager.socketServer();
});

beforeEach(function(done) {
	manager.onAppLoaded(done);
});

beforeEach(function() {
	socketServer.primus.write({
		channel: 'exchange-rates',
		data: {'BTC':1.00000000,'CZK':142155.31,'EUR':5467.50,'LTC':77.85130401,'USD':6389.06,'XMR':49.66476285075738763347},
	});
});

beforeEach(function(done) {
	manager.evaluateInPageContext(function() {
		app.setDeveloperMode(true);
		app.markGettingStartedAsComplete();
		app.settings.set('configurableCryptoCurrencies', ['bitcoinTestnet']);
		app.settings.set('bitcoinTestnet.extendedPublicKey', 'tpubDD8itYXaDtaTuuouxqdvxfYthFvs8xNbheGxwEcGXJyxrzuyMAxv4xbsw96kz4wKLjSyn3Dd8gbB7kF1bdJdphz1ZA9Wf1Vbgrm3tTZVqSs');
		app.settings.set('displayCurrency', 'EUR');
		app.config.paymentRequests.saveDelay = 0;
	}, done);
});

afterEach(function(done) {
	var hash = manager.getPageLocationHash();
	var name = hash.replace(/[#]/g, '').replace('/', '-');
	manager.screenshot(name, done);
});

afterEach(function() {
	socketServer.close();
});
