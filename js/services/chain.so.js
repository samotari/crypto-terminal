var app = app || {};

app.services = app.services || {};

app.services['chain.so'] = (function() {

	'use strict';

	return {

		_pusher: null,
		_channels: [],

		hostname: 'https://chain.so',

		getUri: function(uri) {

			return this.hostname + uri;
		},

		stopListening: function() {

			var pusher = this._pusher;
			_.each(this._channels, function(channel) {
				channel.unbind();
				pusher.unsubscribe(channel.name);
			});
		},

		listenForTransactionsToAddress: function(address, currency, cb) {

			try {
				if (!this._pusher) {
					this._pusher = this.initializePusher();
				}
				var pusher = this._pusher;
				var channel = pusher.subscribe([
					'address',
					currency.toLowerCase(),
					address
				].join('_'));
				channel.bind('balance_update', function(data) {
					if (data.type === 'address') {
						var tx = {
							amount_received: data.value.value_received,
						};
						cb(null, tx);
					}
				});
				this._channels.push(channel);
			} catch (error) {
				return cb(error);
			}
		},

		initializePusher: function() {
			return new Pusher('e9f5cc20074501ca7395', {
				wsHost: 'slanger1.chain.so',
				httpHost: 'slanger1.chain.so',
				wsPort: 443,
				wssPort: 443,
				httpPort: 443,
				httpsPort: 443,
				encrypted: true,
				disabledTransports: ['sockjs'],
				disableStats: true
			});
		}
	};

})();