var app = app || {};

app.services = app.services || {};

app.services.ctApi = (function() {

	'use strict';

	var service = _.extend({

		// Setup a websocket connection to the CT-API server.
		connect: function(cb) {

			var done = _.once(cb);

			if (typeof Primus === 'undefined' || this.primus) {
				// If Primus doesn't exist, then we can't connect.
				// Or, if a primus instance already exists then we are already connected.
				_.defer(done);
				return;
			}

			var uri = this.getUri(app.config.ctApi.primusPath);

			this.primus = Primus.connect(uri);

			this.primus.once('open', function() {
				done();
			});

			this.primus.once('error', function(error) {
				done(error);
			});

			this.primus.on('data', _.bind(this.onData, this));
			this.primus.on('reconnected', _.bind(this.onReconnected, this));
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

			_.defer(_.bind(function() {
				var cacheKey = 'exchange-rates';
				var rates = app.cache.get(cacheKey);
				if (!rates) {
					return cb(new Error(app.i18n.t('ct-api.missing-exchange-rates')));
				}
				if (currency !== 'BTC') {
					rates = this.convertExchangeRates(rates, currency);
				}
				cb(null, rates);
			}, this));
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

	}, Backbone.Events);

	app.queues.onStart.push({
		fn: _.bind(service.connect, service),
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

	return service;

})();
