var _ = require('underscore');
var async = require('async');
var express = require('express');
var mkdirp = require('mkdirp');
var path = require('path');
var puppeteer = require('puppeteer');
var serveStatic = require('serve-static');
var WebSocket = require('ws');

var manager = module.exports = {

	browser: null,
	page: null,

	prepareStaticWebServer: function(done) {

		var app = express();
		app.use(serveStatic('www'));
		app.server = app.listen(3000, done);
		return app;
	},

	prepareBrowser: function(options, done) {

		if (_.isFunction(options)) {
			done = options;
			options = null;
		}

		options = _.defaults({}, options || {}, {
			args: [
				// To prevent CORS errors:
				'--disable-web-security',
			],
			headless: true,
			slowMo: 0,
			timeout: 10000,
		});

		puppeteer.launch(options).then(function(browser) {
			manager.browser = browser;
			done(null, browser);
		}).catch(done);
	},

	navigate: function(uri, done) {

		if (!manager.page) {
			return done(new Error('Must load a page before navigating.'));
		}

		var host = process.env.HTTP_SERVER_HOST || 'localhost';
		var port = parseInt(process.env.HTTP_SERVER_PORT || 3000);
		var baseUrl = 'http://' + host + ':' + port;
		var pageUrl = baseUrl + uri;
		manager.page.goto(pageUrl).then(function() {
			done();
		}).catch(done);
	},

	preparePage: function(done) {

		if (!manager.browser) {
			return done(new Error('Must prepare browser before opening a page.'));
		}

		manager.browser.newPage().then(function(newPage) {
			manager.page = newPage;
			done(null, newPage);
		}).catch(done);
	},

	evaluateInPageContext: function(fn, args, done) {

		if (_.isFunction(args)) {
			done = args;
			args = [];
		}

		manager.page.evaluate.apply(manager.page, [fn].concat(args)).then(function() {
			try {
				var args = Array.prototype.slice.call(arguments);
				done.apply(undefined, [null].concat(args));
			} catch (error) {
				console.log(error);
			}
		}).catch(done);
	},

	onAppLoaded: function(done) {

		done = _.once(done);
		manager.navigate('/', function(error) {
			if (error) return done(error);
			manager.page.waitFor(function() {
				return !!app && !!app.mainView;
			}).then(function() {
				done();
			}).catch(done);
		});
	},

	getPageLocationHash: function() {

		if (!manager.page) {
			throw new Error('No page is loaded.');
		}

		var pageUrl = manager.page.url();
		var parts = pageUrl.indexOf('#') !== -1 ? pageUrl.split('#') : [];
		return parts[1] || '';
	},

	electrumServer: function(port) {
		var wss = new WebSocket.Server({
			port: port,
		});
		var sockets = [];
		wss.on('connection', function(socket) {
			sockets.push(socket);
			var send = socket.send;
			socket.send = function(message) {
				send.apply(socket, arguments);
			};
			socket.on('message', function(message) {
				try {
					var data = JSON.parse(message);
				} catch (error) {
					console.log(error);
				}
				switch (data.method) {
					case 'server.peers.subscribe':
						socket.send(JSON.stringify({
							jsonrpc: '2.0',
							method: data.method,
							result: [],
							id: data.id,
						}));
						break;
					case 'server.ping':
					case 'blockchain.scripthash.unsubscribe':
						socket.send(JSON.stringify({
							jsonrpc: '2.0',
							method: data.method,
							result: null,
							id: data.id,
						}));
						break;
				}
			});
		});
		return {
			wss: wss,
			sockets: sockets,
			waitForClient: function(done) {
				var socket;
				async.until(function() {
					socket = _.last(sockets);
					return !!socket;
				}, function(next) {
					_.delay(next, 5);
				}, function() {
					done(null, socket);
				});
			},
			mock: {
				receiveTx: function(socket, tx, done) {
					var getHistoryCalls = 0;
					var cb = _.once(function(error) {
						socket.off('message', onMessage);
						if (error) return done(error);
						done();
					});
					var onMessage = function(message) {
						try {
							var data = JSON.parse(message);
						} catch (error) {
							return cb(error);
						}
						if (data.method === 'blockchain.scripthash.subscribe') {
							// Respond with initial scripthash status.
							socket.send(JSON.stringify({
								jsonrpc: '2.0',
								method: data.method,
								params: [],
								id: data.id,
							}));
							_.delay(function() {
								// Send a status change.
								socket.send(JSON.stringify({
									jsonrpc: '2.0',
									method: 'blockchain.scripthash.subscribe',
									params: [
										data.params[0],// scripthash
										'latest-scripthash-status',// latest status
									],
									id: data.id,
								}));
							}, 10);
						} else if (data.method === 'blockchain.scripthash.get_history') {
							getHistoryCalls++;
							switch (getHistoryCalls) {
								case 1:
									socket.send(JSON.stringify({
										jsonrpc: '2.0',
										method: data.method,
										result: [],
										id: data.id,
									}));
									break;
								default:
									socket.send(JSON.stringify({
										jsonrpc: '2.0',
										method: data.method,
										result: [tx],
										id: data.id,
									}));
									break;
							}
						} else if (data.method === 'blockchain.transaction.get') {
							socket.send(JSON.stringify({
								jsonrpc: '2.0',
								method: data.method,
								result: tx.hex,
								id: data.id,
							}));
							// This is the last message needed to mock a tx for the client.
							cb();
						}
					};
					socket.on('message', onMessage);
				},
			},
			close: function(done) {
				wss.close(done);
			},
		};
	},

	connectElectrumClient: function(name, servers, done) {
		manager.socketServer.sockets = [];
		async.series([
			function(next) {
				manager.evaluateInPageContext(function(name, servers) {
					app.paymentMethods[name].electrum.servers = servers;
					app.initializeElectrumServices({
						force: true,
					});
				}, [name, servers], next);
			},
			function(next) {
				manager.page.waitFor(function(name) {
					return !!app.services.electrum[name];
				}, {}/* options */, [name]).then(function() {
					next();
				}).catch(next);
			},
			function(next) {
				manager.evaluateInPageContext(function(name) {
					app.services.electrum[name].connectClients(function() {});
				}, [name], next);
			},
		], function(error) {
			if (error) return done(error);
			manager.socketServer.waitForClient(done);
		});
	},

	screenshot: function(name, done) {
		var extension = '.png';
		var dir = path.join(__dirname, '..', 'build', 'screenshots');
		var fileName = name + extension;
		var filePath = path.join(dir, fileName);
		async.series([
			function(next) {
				mkdirp(dir, next);
			},
			function(next) {
				manager.page.screenshot({
					path: filePath,
				}).then(function() {
					next();
				}).catch(next);
			},
		], done);
	},

	// Execute a function in the context of the current browser page.
	evaluateFn: function(options, cb) {

		manager.page.evaluate(function(evaluateOptions) {
			return new Promise(function(resolve, reject) {
				try {
					(function() {
						if (typeof evaluateOptions !== 'object') {
							throw new Error('Invalid argument ("evaluateOptions"): Object expected');
						}
						if (typeof evaluateOptions.args === 'undefined') {
							throw new Error('Missing required option ("args")');
						}
						if (typeof evaluateOptions.fn === 'undefined') {
							throw new Error('Missing required option ("fn")');
						}
						if (typeof evaluateOptions.isAsync === 'undefined') {
							throw new Error('Missing required option ("isAsync")');
						}
						if (typeof evaluateOptions.fn !== 'string') {
							throw new Error('Invalid option ("fn"): String expected');
						}
						if (!(evaluateOptions.args instanceof Array)) {
							throw new Error('Missing required option ("args"): Array expected');
						}
						evaluateOptions.isAsync = evaluateOptions.isAsync === true;
						// Find the test function in the context of the page.
						var fn = (function() {
							var parts = evaluateOptions.fn.split('.');
							var parent = window;
							while (parts.length > 1) {
								parent = parent[parts.shift()];
							}
							var fn = parent[parts[0]];
							if (typeof fn === 'undefined') {
								throw new Error('Function does not exist: "' + evaluateOptions.fn + '"');
							}
							// Bind the function to the parent context.
							return function() {
								return fn.apply(parent, arguments);
							};
						})();
						if (evaluateOptions.isAsync) {
							// Asynchronous execution.
							var done = function(error) {
								var args = Array.prototype.slice.call(arguments);
								if (args[0] instanceof Error) {
									args[0] = args[0].message
								} else if (_.isObject(args[0])) {
									if (args[0].responseJSON && args[0].responseJSON.error) {
										args[0] = args[0].responseJSON.error;
									} else if (args[0].status) {
										args[0] = args[0].statusText;
									} else if (args[0].status === 0) {
										args[0] = 'FAILED_HTTP_REQUEST';
									}
								}
								resolve(args);
							};
							var args = evaluateOptions.args.concat(done);
							fn.apply(undefined, args);
						} else {
							// Synchronous execution.
							var thrownError;
							try {
								var result = fn.apply(undefined, evaluateOptions.args);
							} catch (error) {
								return resolve([error.message]);
							}
							return resolve([null, result]);
						}
					})();
				} catch (error) {
					return reject(error);
				}
			});
		}, options)
			.then(function(args) {
				if (args[0]) {
					args[0] = new Error(args[0]);
				}
				cb.apply(undefined, args);
			})
			.catch(cb);
	},

};
