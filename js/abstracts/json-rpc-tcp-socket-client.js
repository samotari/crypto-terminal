var app = app || {};

app.abstracts = app.abstracts || {};

app.abstracts.JsonRpcTcpSocketClient = (function() {

	var JsonRpcTcpSocketClient = function(options) {

		if (!this.supportsNativeSocket() && !this.supportsWebSocket()) {
			throw new Error('Platform must support either native or web sockets');
		}

		_.bindAll(this,
			'isConnected',
			'tryReconnect'
		);

		this.options = _.defaults(options || {}, {
			id: _.uniqueId('json-rpc-tcp-socket-client'),
			timeout: app.config.jsonRpcTcpSocketClient.timeout,
		}, this.defaultOptions);

		this.socket = null;
		this.incompleteMessageBuffer = '';

		if (options.autoReconnect) {
			this.on('close', this.tryReconnect);
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
		autoReconnect: true,
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

	JsonRpcTcpSocketClient.prototype.open = function(cb) {
		app.log('json-rpc-tcp-socket-client.open', this.options);
		var options = this.options;
		var parseData = _.bind(this.parseData, this);
		var trigger = _.bind(this.trigger, this);
		var done = _.once(cb);
		var socket;
		if (this.supportsNativeSocket()) {
			// Native Socket
			socket = this.socket = new Socket();
			socket.onData = function(dataByteArray) {
				_.each(parseData(dataByteArray), function(data) {
					if (data.id) {
						trigger('data:' + data.id, data);
					}
					trigger('data', data);
				});
			};
			socket.onClose = function(hasError) {
				app.log('json-rpc-tcp-socket-client.onClose', options, { hasError: hasError });
				trigger('close', { hasError: hasError });
			};
			socket.open(options.hostname, options.port, options.timeout,
				function onOpenSuccess() {
					app.log('json-rpc-tcp-socket-client.onOpenSuccess', options);
					done();
				},
				function onOpenError(error) {
					app.log('json-rpc-tcp-socket-client.onOpenError', options, error);
					done(error);
				}
			);
		} else {
			// WebSocket
			socket = this.socket = (function() {
				var protocol = options.encrypted ? 'wss://' : 'ws://';
				var url = protocol + options.hostname + ':' + options.port;
				return new WebSocket(url);
			})();
			socket.onmessage = function(evt) {
				_.each(parseData(evt.data), function(data) {
					if (data.id) {
						trigger('data:' + data.id, data);
					}
					trigger('data', data);
				});
			};
			socket.onclose = function() {
				app.log('json-rpc-tcp-socket-client.onClose', options);
				trigger('close');
			};
			socket.onopen = function() {
				app.log('json-rpc-tcp-socket-client.onOpenSuccess', options);
				done();
			};
			socket.onerror = function(error) {
				app.log('json-rpc-tcp-socket-client.onOpenError', options, error);
				done(error);
			};
		}
		return socket;
	};

	JsonRpcTcpSocketClient.prototype.tryReconnect = function() {
		app.log('json-rpc-tcp-socket-client.tryReconnect');
		var options = this.options;
		var trigger = _.bind(this.trigger, this);
		if (this.supportsNativeSocket()) {
			// Native Socket
			this.socket.open(options.hostname, options.port, options.timeout,
				function onReconnectSuccess() {
					app.log('json-rpc-tcp-socket-client.onReconnectSuccess', options);
					trigger('reconnect');
				},
				function onReconnectError(error) {
					app.log('json-rpc-tcp-socket-client.onReconnectError', options, error);
				}
			);
		} else {
			// WebSocket
			this.open(function(error) {
				if (error) {
					app.log('json-rpc-tcp-socket-client.onReconnectError', options, error);
				} else {
					app.log('json-rpc-tcp-socket-client.onReconnectSuccess', options);
					trigger('reconnect');
				}
			});
		}
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
		app.log('json-rpc-tcp-socket-client.cmd:', data);
		this.once('data:' + data.id, function(result) {
			app.log('json-rpc-tcp-socket-client.cmd (result):', result);
			if (result.error) {
				var error = new Error(result.error.message);
				error.code = result.error.code;
				return done(error);
			}
			done(null, result.result);
		});
		var done = _.once(_.bind(function() {
			this.off('data:' + data.id);
			cb.apply(undefined, arguments);
		}, this));
		try {
			if (this.supportsNativeSocket()) {
				// Native Socket
				var dataByteArray = this.toByteArray(dataString);
				this.socket.write(dataByteArray, function onWriteSuccess() {
					app.log('json-rpc-tcp-socket-client.onWriteSuccess', arguments);
				}, function onWriteError(error) {
					app.log('json-rpc-tcp-socket-client.onWriteError', arguments);
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
		app.log('json-rpc-tcp-socket-client.destroy');
		cb = cb || _.noop;
		// Remove all listeners on the socket client.
		this.off();
		if (this.isConnected()) {
			app.log('json-rpc-tcp-socket-client.destroy.isConnected: true');
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
			app.log('json-rpc-tcp-socket-client.destroy.isConnected: false');
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
					app.log('json-rpc-tcp-socket-client.invalid-json', message);
					return null;
				}
				return result;
			}).compact().value();
		} catch (error) {
			app.log('json-rpc-tcp-socket-client.parseData.failed', rawData, dataString, error);
			return [];
		}
		app.log('json-rpc-tcp-socket-client.parseData.success', data);
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