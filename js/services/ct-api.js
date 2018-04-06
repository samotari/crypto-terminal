var app = app || {};

app.services = app.services || {};

app.services.ctApi = (function() {

	'use strict';

	var ctApi = {

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

			app.log('socket.data', data);
			if (!_.isObject(data) || !data.channel) return;
			var listeners = this.subscriptions[data.channel] || {};
			_.each(listeners, function(fn) {
				fn(data.data);
			});
		},

		// On reconnect, the client is responsible for re-establishing channel subscriptions.
		onReconnected: function() {
			var channels = _.chain(this.subscriptions).keys().uniq().value();
			_.each(channels, function(channel) {
				this.primus.write({
					channel: channel,
					action: 'join',
				});
			}, this);
		},

		subscriptions: {},

		hasSubscriptions: function(channel) {
			return _.values(this.subscriptions[channel]).length > 0;
		},

		subscribe: function(channel, onData) {

			if (!channel || !this.primus) return;
			if (!this.hasSubscriptions(channel)) {
				this.primus.write({
					channel: channel,
					action: 'join',
				});
			}
			var subscriptionId = _.uniqueId('ct-api-subscription:' + channel + ':');
			this.subscriptions[channel] = this.subscriptions[channel] || {};
			this.subscriptions[channel][subscriptionId] = onData;
			return subscriptionId;
		},

		unsubscribe: function(subscriptionId) {

			if (!subscriptionId || subscriptionId.indexOf(':') === -1) return;
			var parts = subscriptionId.split(':');
			var channel = parts[1];
			if (!channel || !this.primus) return;
			this.subscriptions[channel] = this.subscriptions[channel] || {};
			delete this.subscriptions[channel][subscriptionId];
			if (!this.hasSubscriptions(channel)) {
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
		}
	};

	app.queues.onStart.push({
		fn: _.bind(ctApi.connect, ctApi),
	});

	app.onReady(function() {
		ctApi.subscribe('exchange-rates', function(data) {
			app.cache.set('exchange-rates', data);
		});
	});

	return ctApi;

})();
