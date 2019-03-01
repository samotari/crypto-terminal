var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var https = require('https');
var httpProxy = require('http-proxy');
var path = require('path');
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
				default: 8081,
			}, next);
		},
		lndRestUrl: function(next) {
			read({
				prompt: 'lnd REST URL',
				default: 'https://localhost:8080',
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

var getSelfSignedCertificateAndKey = function(cb) {
	var filePaths = {
		cert: path.join(__dirname, '..', 'lnd-proxy.cert'),
		key: path.join(__dirname, '..', 'lnd-proxy.key'),
	};
	async.parallel({
		cert: fs.readFile.bind(fs, filePaths.cert),
		key: fs.readFile.bind(fs, filePaths.key),
	}, function(error, results) {
		if (!error) return cb(null, results);
		// Missing certificate or key file.
		// Create and save them.
		pem.createCertificate({ days: 1, selfSigned: true }, function(error, results) {
			if (error) return cb(error);
			async.parallel({
				cert: fs.writeFile.bind(fs, filePaths.cert, results.certificate),
				key: fs.writeFile.bind(fs, filePaths.key, results.serviceKey),
			}, function(error) {
				if (error) return cb(error);
				var selfSigned = {
					cert: results.certificate,
					key: results.serviceKey,
				};
				cb(null, selfSigned);
			});
		});
	});
};

async.series({
	config: getConfigurations,
	selfSigned: getSelfSignedCertificateAndKey,
}, function(error, results) {

	if (error) {
		console.error(error);
		process.exit(1);
	}

	var config = results.config;
	config.selfSigned = results.selfSigned;

	https.createServer({
		key: config.selfSigned.key,
		cert: config.selfSigned.cert,
	}, function(req, res) {
		try {
			res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
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
