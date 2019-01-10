var app = app || {};

app.services = app.services || {};

app.services.ctApi = (function() {

	'use strict';

	var service = _.extend({

		// Setup a websocket connection to the CT-API server.
		connect: function(cb) {

			var done = _.once(cb);

			if (this.primus) {
				// Primus already initialized.
				return _.defer(done);
			}

			if (typeof Primus === 'undefined') {
				// If Primus doesn't exist, then we can't connect.
				return _.defer(function() {
					done(new Error('Failed to open websocket connection because primus.js could not be loaded'));
				});
			}

			var uri = this.getUri(app.config.ctApi.primusPath);
			var primus = this.primus = Primus.connect(uri, app.config.primus);

			primus.once('open', function() {
				done();
			});

			primus.once('error', function(error) {
				done(error);
			});

			primus.on('data', _.bind(this.onData, this));
			primus.on('reconnected', _.bind(this.onReconnected, this));
			primus.on('offline', _.bind(this.trigger, this, 'offline'));
			primus.on('online', _.bind(this.trigger, this, 'online'));
		},

		getUri: function(uri, params) {

			var url = app.config.ctApi.baseUrl + uri;
			if (!_.isEmpty(params)) {
				url += '?' + querystring.stringify(params);
			}
			return url;
		},

		/*
			Route channel data.

			Expect data to look like this:
			{
				channel: '<CHANNEL NAME>',
				data: {}// Can be any valid JSON (e.g null, {}, 42)
			}
		*/
		onData: function(data) {

			app.log('ct-api.data', data);
			this.trigger(data.channel, data.data);
		},

		// On reconnect, the client is responsible for re-establishing channel subscriptions.
		onReconnected: function() {

			app.log('ct-api.reconnected');
			var channels = this.listSubscribedChannels();
			_.each(channels, function(channel) {
				this.primus.write({
					channel: channel,
					action: 'join',
				});
			}, this);
		},

		listSubscribedChannels: function() {

			return _.keys(this._events);
		},

		isSubscribed: function(channel) {

			var listeners = this._events && this._events[channel] || [];
			return listeners.length > 0;
		},

		isValidChannel: function(channel) {

			return _.isString(channel);
		},

		subscribe: function(channel, listener) {

			app.log('ct-api.subscribe', channel, listener);

			if (!channel) {
				throw new Error('ct-api.channel.required');
			}

			if (!this.isValidChannel(channel)) {
				throw new Error('ct-api.channel.invalid');
			}

			if (!listener) {
				throw new Error('ct-api.listener.required');
			}

			if (!_.isFunction(listener)) {
				throw new Error('ct-api.listener.invalid');
			}

			if (!this.primus) {
				throw new Error('ct-api.no-socket-connection');
			}

			if (!this.isSubscribed(channel)) {
				this.primus.write({
					channel: channel,
					action: 'join',
				});
			}

			this.on(channel, listener);
		},

		unsubscribe: function(channel, listener) {

			app.log('ct-api.unsubscribe', channel, listener);

			if (!channel) {
				throw new Error('ct-api.channel.required');
			}

			if (!this.isValidChannel(channel)) {
				throw new Error('ct-api.channel.invalid');
			}

			if (!listener) {
				throw new Error('ct-api.listener.required');
			}

			if (!_.isFunction(listener)) {
				throw new Error('ct-api.listener.invalid');
			}

			if (!this.primus) {
				throw new Error('ct-api.no-socket-connection');
			}

			this.off(channel, listener);

			if (!this.isSubscribed(channel)) {
				this.primus.write({
					channel: channel,
					action: 'leave',
				});
			}
		},

		getExchangeRates: function(currency, cb) {

			var convertExchangeRates = _.bind(this.convertExchangeRates, this);
			var maxWaitTime = app.config.ctApi.exchangeRates.timeout;
			var startTime = Date.now();
			var rates;

			async.until(function() {
				rates = app.cache.get('exchange-rates');
				return !!rates;
			}, function(next) {

				var elapsedTime = Date.now() - startTime;

				if (elapsedTime > maxWaitTime) {
					return next(new Error(app.i18n.t('ct-api.missing-exchange-rates')))
				}

				_.delay(next, 20);

			}, function(error) {

				if (error) {
					return cb(error);
				}

				if (currency !== 'BTC') {
					rates = convertExchangeRates(rates, currency);
				}

				cb(null, rates);
			});
		},

		// Exchange rates from the API server are BTC-centric.
		// To get make a nice object of rates for another currency, we need to do some magic.
		convertExchangeRates: function(rates, currency) {

			// Convert from SOMETHING->BTC rate to SOMETHING->CURRENCY.
			var btcRate = (new BigNumber(1)).dividedBy(rates[currency]);
			return _.mapObject(rates, function(rate) {
				return btcRate.times(rate).toString();
			});
		},

		getMoneroOutputs: function(networkName, txObject, cb) {

			var uri = this.getUri('/api/v1/monero/outputs', _.assign({ network: networkName }, txObject));
			$.get(uri).then(function(result) {
				cb(null, result);
			}).catch(cb)
		},

		getFeeRate: function(network, cb) {

			var uri = this.getUri('/api/v1/fee-rate', {
				network: network,
			});
			$.get(uri).then(function(result) {
				cb(null, result);
			}).catch(cb)
		},

		getUnspentTxOutputs: function(network, addresses, cb) {

			var uri = this.getUri('/api/v1/utxo', {
				addresses: addresses.join(','),
				network: network,
			});
			$.get(uri).then(function(result) {
				cb(null, result);
			}).catch(cb)
		},

		broadcastRawTx: function(network, rawTx, cb) {

			var uri = this.getUri('/api/v1/raw-tx');
			var data = {
				network: network,
				rawTx: rawTx,
			};
			$.post(uri, data).then(function(result) {
				cb(null, result);
			}).catch(cb)
		},

		doWhenOnline: function(cb) {

			async.until(function() {
				return navigator.onLine;
			}, function(next) {
				_.delay(next, 500);
			}, cb);
		},

		loadPrimusLibrary: function(cb) {

			var numAttempts = 0;
			var maxAttempts = 5;
			var $script = $('script#primus-library');
			var src = $script.attr('src');
			async.until(_.bind(function() {
				return this.primusLibraryLoaded() || numAttempts >= maxAttempts;
			}, this), function(next) {
				numAttempts++;
				$.getScript(src, function() {
					next();
				}).fail(function() {
					_.delay(next, 500);
				});
			}, _.bind(function() {
				if (!this.primusLibraryLoaded()) {
					cb(new Error('Failed to load primus.js library'));
				} else {
					cb();
				}
			}, this));
		},

		primusLibraryLoaded: function() {

			return typeof Primus !== 'undefined';
		},

	}, Backbone.Events);

	app.onStart(function(done) {
		if (!service.primusLibraryLoaded()) {
			// Primus library is not available.
			// This means we are offline completely (at page load).
			$('html').addClass('offline');
			// Wait until we are back online.
			service.doWhenOnline(function() {
				// Then try to load the primus library.
				service.loadPrimusLibrary(function(error) {
					if (error) {
						// Failed to load the primus library, so can't do anything.
						app.log(error);
					} else {
						// Now we can try to establish a websock connection.
						service.connect(function(error) {
							if (error) {
								app.log(error);
							} else {
								$('html').removeClass('offline');
							}
						});
					}
				});
			});
			done();
		} else {
			// Primus library is available.
			// Try to establish a websocket connection.
			service.connect(function(error) {
				if (error) {
					$('html').addClass('offline');
					app.log(error);
				}
				done();
			});
		}
	});

	app.onReady(function() {
		try {
			service.subscribe('exchange-rates', function(data) {
				app.cache.set('exchange-rates', data);
			});
		} catch (error) {
			app.log('ct-api', error);
		}
	});

	service.on('offline', function() {
		$('html').addClass('offline');
		app.device.trigger('offline');
	});

	service.on('online', function() {
		$('html').removeClass('offline');
		app.device.trigger('online');
	});

	return service;

})();
