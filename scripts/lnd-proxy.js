var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var https = require('https');
var httpProxy = require('http-proxy');
var pem = require('pem');
var proxy = httpProxy.createProxyServer({
	secure: false,
});
var read = require('read');

// Set the process title so that we can properly kill the process.
// Change hyphens ("-") to underscores ("_").
process.title = _.last(process.argv[1].split('/')).replace(/-/g, '_');

var getConfigurations = function(done) {
	async.series({
		proxyHost: function(next) {
			read({
				prompt: 'Proxy server host',
				default: 'localhost',
			}, next);
		},
		proxyPort: function(next) {
			read({
				prompt: 'Proxy server port',
				default: 3100,
			}, next);
		},
		lndRestUrl: function(next) {
			read({
				prompt: 'lnd REST URL',
				default: 'https://localhost:4000',
			}, next);
		},
	}, function(error, results) {
		if (error) return done(error);
		var config = _.chain(results).map(function(result, key) {
			return [key, result[0]];
		}).object().value();
		done(null, config);
	});
};

async.series({
	config: function(next) {
		getConfigurations(next);
	},
	keys: function(next) {
		pem.createCertificate({ days: 1, selfSigned: true }, next);
	},
}, function(error, results) {

	if (error) {
		console.error(error);
		process.exit(1);
	}

	var config = results.config;
	config.keys = results.keys;

	https.createServer({
		key: config.keys.serviceKey,
		cert: config.keys.certificate,
	}, function(req, res) {
		try {
			res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
			res.setHeader('Access-Control-Request-Method', '*');
			res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
			res.setHeader('Access-Control-Allow-Headers', '*');
			if (req.method === 'OPTIONS') {
				res.writeHead(200);
				res.end();
				return;
			}
		} catch (error) {
			console.log(error);
		}
		proxy.web(req, res, {
			target: config.lndRestUrl,
		}, function(error) {
			console.log(error);
		});
	}).listen(config.proxyPort, config.proxyHost, function() {
		console.log('');
		console.log('Success!');
		console.log('Proxy server now listing at', 'https://' + [config.proxyHost, config.proxyPort].join(':'));
	});
});
