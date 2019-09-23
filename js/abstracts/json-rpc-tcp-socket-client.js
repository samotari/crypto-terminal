var app = app || {};

app.abstracts = app.abstracts || {};

app.abstracts.JsonRpcTcpSocketClient = (function() {

	var JsonRpcTcpSocketClient = function(options) {

		if (!this.supportsNativeSocket() && !this.supportsWebSocket()) {
			throw new Error('Platform must support either native or web sockets');
		}

		this.options = _.defaults(options || {}, {
			id: _.uniqueId('json-rpc-tcp-socket-client'),
			timeout: app.config.jsonRpcTcpSocketClient.timeout,
		}, this.defaultOptions);

		this.socket = null;
		this.incompleteMessageBuffer = '';

		if (options.autoReconnect) {
			this.on('close', _.bind(this.reconnect, this, _.noop));
		}
	};

	_.extend(JsonRpcTcpSocketClient.prototype, Backbone.Events);

	JsonRpcTcpSocketClient.prototype.defaultOptions = {
		hostname: null,
		port: null,
		user: null,
		pass: null,
		encrypted: false,
		version: '2.0',
		open: {
			retry: {
				interval: 3000,
				times: 10,
			},
		},
		autoReconnect: true,
		reconnect: {
			retry: {
				interval: 3000,
				times: 10,
			},
		},
		cmd: {
			timeout: 3000,
		},
	};

	JsonRpcTcpSocketClient.prototype.supportsNativeSocket = function() {
		return typeof Socket !== 'undefined';
	};

	JsonRpcTcpSocketClient.prototype.supportsWebSocket = function() {
		return typeof WebSocket !== 'undefined';
	};

	JsonRpcTcpSocketClient.prototype.isConnected = function() {
		if (this.socket) {
			if (this.supportsNativeSocket()) {
				// Native Socket
				return this.socket.state === 2;
			} else {
				// WebSocket
				return this.socket.readyState === WebSocket.OPEN;
			}
		}
		return false;
	};

	JsonRpcTcpSocketClient.prototype.getHost = function() {
		return [this.options.hostname, this.options.port].join(':');
	};

	JsonRpcTcpSocketClient.prototype.open = function(done) {
		app.log('JsonRpcTcpSocketClient.open', this.options);
		var tryConnect = _.bind(this.tryConnect, this);
		async.retry(this.options.open.retry, function(next) {
			app.whenOnline(function() {
				tryConnect(next);
			});
		}, function(error) {
			if (error) {
				app.log('JsonRpcTcpSocketClient: Failed to open socket', error);
				done(error);
			} else {
				app.log('JsonRpcTcpSocketClient: Successfully opened socket');
				done();
			}
		});
	};

	JsonRpcTcpSocketClient.prototype.reconnect = function(done) {
		app.log('JsonRpcTcpSocketClient.reconnect', this.options);
		done = done || _.noop;
		var trigger = _.bind(this.trigger, this);
		var tryConnect = _.bind(this.tryConnect, this);
		async.retry(this.options.reconnect.retry, function(next) {
			app.whenOnline(function() {
				tryConnect(next);
			});
		}, function(error) {
			if (error) {
				app.log('JsonRpcTcpSocketClient: Failed to reconnect', error);
				done(error);
			} else {
				app.log('JsonRpcTcpSocketClient: Successfully reconnected');
				trigger('reconnect');
				done();
			}
		});
	};

	JsonRpcTcpSocketClient.prototype.tryConnect = function(done) {
		app.log('JsonRpcTcpSocketClient.tryConnect');
		if (this.supportsNativeSocket()) {
			// Native Socket
			if (!this.socket) {
				// Only create the socket instance once.
				this.socket = this.createSocket();
			}
			this.socket.open(this.options.hostname, this.options.port, this.options.timeout,
				function onSuccess() {
					done();
				},
				function onError(error) {
					done(error);
				}
			);
		} else {
			// WebSocket
			// Always recreate the socket instance.
			this.socket = this.createSocket();
			this.socket.onopen = function() {
				done();
			};
			this.socket.onerror = function(error) {
				done(error);
			};
		}
	};

	JsonRpcTcpSocketClient.prototype.createSocket = function() {
		var socket;
		var parseData = _.bind(this.parseData, this);
		var trigger = _.bind(this.trigger, this);
		if (this.supportsNativeSocket()) {
			// Native Socket
			socket = new Socket();
			socket.onData = function(dataByteArray) {
				_.each(parseData(dataByteArray), function(data) {
					if (data.id) {
						trigger('data:' + data.id, data);
					}
					trigger('data', data);
				});
			};
			socket.onClose = function(hasError) {
				app.log('JsonRpcTcpSocketClient: Socket connection closed', { hasError: hasError });
				trigger('close', { hasError: hasError });
			};
		} else {
			// WebSocket
			var protocol = this.options.encrypted ? 'wss://' : 'ws://';
			var uri = protocol + this.options.hostname + ':' + this.options.port;
			socket = new WebSocket(uri);
			socket.onmessage = function(evt) {
				_.each(parseData(evt.data), function(data) {
					if (data.id) {
						trigger('data:' + data.id, data);
					}
					trigger('data', data);
				});
			};
			socket.onclose = function() {
				app.log('JsonRpcTcpSocketClient: Socket connection closed');
				trigger('close');
			};
		}
		return socket;
	};

	JsonRpcTcpSocketClient.prototype.cmd = function(method, params, cb) {
		if (_.isFunction(params)) {
			cb = params;
			params = [];
		}
		if (!_.isString(method)) {
			return cb(new Error('Expected method to be a string'));
		}
		var data = {
			jsonrpc: this.options.version,
			method: method,
			params: params,
			id: _.uniqueId(),
		};
		var dataString = JSON.stringify(data) + '\n';
		app.log('JsonRpcTcpSocketClient.cmd:', data);
		this.once('data:' + data.id, function(result) {
			app.log('JsonRpcTcpSocketClient.cmd (result):', result);
			if (result.error) {
				var error = new Error(result.error.message);
				error.code = result.error.code;
				return done(error);
			}
			done(null, result.result);
		});
		var timeout = _.delay(function() {
			done(new Error('Timed-out while waiting for response'));
		}, this.options.cmd.timeout);
		var done = _.once(_.bind(function() {
			clearTimeout(timeout);
			this.off('data:' + data.id);
			cb.apply(undefined, arguments);
		}, this));
		try {
			if (this.supportsNativeSocket()) {
				// Native Socket
				var dataByteArray = this.toByteArray(dataString);
				this.socket.write(dataByteArray, function onWriteSuccess() {
					app.log('JsonRpcTcpSocketClient.onWriteSuccess', arguments);
				}, function onWriteError(error) {
					app.log('JsonRpcTcpSocketClient.onWriteError', arguments);
					done(error);
				});
			} else {
				// WebSocket
				this.socket.send(dataString);
			}
		} catch (error) {
			return done(error);
		}
	};

	JsonRpcTcpSocketClient.prototype.destroy = function(cb) {
		app.log('JsonRpcTcpSocketClient.destroy');
		cb = cb || _.noop;
		// Remove all listeners on the socket client.
		this.off();
		if (this.isConnected()) {
			app.log('JsonRpcTcpSocketClient.destroy.isConnected: true');
			this.once('close', function() {
				cb();
			});
			if (this.supportsNativeSocket()) {
				// Native Socket
				// Attempt to close the connection gracefully.
				this.socket.shutdownWrite();
			} else {
				// WebSocket
				this.socket.close();
			}
		} else {
			app.log('JsonRpcTcpSocketClient.destroy.isConnected: false');
			_.defer(cb);
		}
	};

	JsonRpcTcpSocketClient.prototype.parseData = function(rawData) {
		try {
			var dataString;
			if (rawData instanceof Uint8Array) {
				dataString = this.fromByteArray(rawData)
			} else {
				dataString = rawData;
			}
			if (this.incompleteMessageBuffer) {
				dataString = this.incompleteMessageBuffer + dataString;
				this.incompleteMessageBuffer = '';
			}
			// Split the data string by line-break character.
			// Each line is a separate data object.
			var data = _.chain(dataString.split('\n')).compact().filter(function(message) {
				if (!this.isCompleteMessage(message)) {
					this.incompleteMessageBuffer += message;
					return false;
				}
				return true;
			}, this).map(function(message) {
				try {
					var result = JSON.parse(message);
				} catch (error) {
					app.log('JsonRpcTcpSocketClient.invalid-json', message);
					return null;
				}
				return result;
			}).compact().value();
		} catch (error) {
			app.log('JsonRpcTcpSocketClient.parseData.failed', rawData, dataString, error);
			return [];
		}
		app.log('JsonRpcTcpSocketClient.parseData.success', data);
		return data;
	};

	JsonRpcTcpSocketClient.prototype.isCompleteMessage = function(message) {
		try {
			JSON.parse(message);
		} catch (error) {
			// Do nothing with the error here because this is just a check.
			return false
		}
		return true;
	};

	JsonRpcTcpSocketClient.prototype.fromByteArray = function(dataByteArray) {
		if (!(dataByteArray instanceof Uint8Array)) {
			throw new Error('Expected a byte array');
		}
		return Buffer.from(dataByteArray).toString('utf8');
	};

	JsonRpcTcpSocketClient.prototype.toByteArray = function(dataString) {
		if (!_.isString(dataString)) {
			throw new Error('Expected a string');
		}
		var dataByteArray = new Uint8Array(dataString.length);
		for (var index = 0; index < dataByteArray.length; index++) {
			dataByteArray[index] = dataString.charCodeAt(index);
		}
		return dataByteArray;
	};

	return JsonRpcTcpSocketClient;

})();