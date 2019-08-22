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

beforeEach(function(done) {
	manager.onAppLoaded(done);
});

beforeEach(function(done) {
	manager.evaluateInPageContext(function() {
		app.markGettingStartedAsComplete();
		app.settings.set('configurableCryptoCurrencies', ['bitcoinTestnet']);
		app.settings.set('bitcoinTestnet.extendedPublicKey', 'tpubDD8itYXaDtaTuuouxqdvxfYthFvs8xNbheGxwEcGXJyxrzuyMAxv4xbsw96kz4wKLjSyn3Dd8gbB7kF1bdJdphz1ZA9Wf1Vbgrm3tTZVqSs');
		app.settings.set('displayCurrency', 'BTC');
		app.config.paymentRequests.saveDelay = 0;
	}, done);
});

afterEach(function(done) {
	var hash = manager.getPageLocationHash();
	var name = hash.replace(/[#]/g, '').replace('/', '-');
	manager.screenshot(name, done);
});
