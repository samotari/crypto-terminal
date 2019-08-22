var app = app || {};

app.services = app.services || {};

app.services.exchangeRates = (function() {

	'use strict';

	var service = {
		defaultOptions: {
			cache: true,
			currencies: {
				from: null,
				to: null,
			},
			retry: {
				// See https://caolan.github.io/async/v3/docs.html#retry
				errorFilter: function(error) {
					if (error instanceof Error) return false;
					if (!_.isUndefined(error.status)) {
						if (error.status === 0) return false;
						if (error.status >= 400 && error.status <= 499) return false;
					}
					return true;
				},
				interval: 5000,
				times: 3,
			},
			provider: null,
		},
		get: function(options, done) {
			if (_.isFunction(options)) {
				done = options;
				options = {};
			}
			options = _.defaults(options || {}, this.defaultOptions);
			if (options.cache) {
				var cacheKey = this.getCacheKey('services.exchange-rates.rate.'/* prefix */, options);
				var fromCache = app.cache.get(cacheKey);
				if (fromCache) return done(null, fromCache);
			}
			this.fetch(options, function(error, result) {
				if (error || !result) {
					if (error) {
						app.log(error);
					}
					error = new Error(app.i18n.t('services.exchange-rates.unsupported-currency-pair', options.currencies));
					return done(error);
				}
				if (result) {
					result = result.toString();
					if (options.cache) {
						app.cache.set(cacheKey, result);
					}
				}
				done(null, result);
			});
		},
		fetch: function(options, done) {
			if (_.isFunction(options)) {
				done = options;
				options = {};
			}
			options = _.defaults(options || {}, this.defaultOptions);
			if (!options.currencies) {
				return done(new Error('Missing required option: "currencies"'));
			}
			if (!_.isObject(options.currencies)) {
				return done(new Error('Invalid option ("currencies"): Object expected'));
			}
			if (!_.isString(options.currencies.from)) {
				return done(new Error('Invalid option ("currencies.from"): String expected'));
			}
			if (!_.isString(options.currencies.to)) {
				return done(new Error('Invalid option ("currencies.to"): String expected'));
			}
			if (!options.provider) {
				return done(new Error('Missing required option: "provider"'));
			}
			if (!_.isString(options.provider)) {
				return done(new Error('Invalid option ("provider"): String expected'));
			}
			this.getRateFromProvider(options.provider, options, done);
		},
		getRateFromProvider: function(providerName, options, done) {
			try {
				var ajaxOptions = this.prepareProviderAjaxOptions(providerName, options);
			} catch (error) {
				return done(error);
			}
			async.retry(options.retry, function(next) {
				try {
					$.ajax(ajaxOptions).done(function(data) {
						if (data.error) {
							return next(new Error(data.error));
						}
						next(null, data.result);
					}).fail(function(error) {
						if (error.responseJSON) {
							return next(new Error(JSON.stringify(error.responseJSON)));
						}
						next(error);
					});
				} catch (error) {
					return next(error);
				}
			}, done);
		},
		prepareProviderAjaxOptions: function(providerName, options) {
			var provider = this.getProvider(providerName);
			if (!provider) {
				throw new Error('Unknown provider: "' + providerName + '"');
			}
			if (!provider.url) {
				throw new Error('Missing provider config: "url"');
			}
			if (!provider.jsonPath) {
				throw new Error('Missing provider config: "jsonPath"');
			}
			if (!_.isObject(provider.jsonPath)) {
				throw new Error('Invalid provider config ("jsonPath"): Object expected');
			}
			if (!_.isUndefined(provider.convertSymbols) && !_.isObject(provider.convertSymbols)) {
				throw new Error('Invalid provider config ("convertSymbols"): Object expected');
			}
			var currencies = {};
			_.each(options.currencies, function(symbol, key) {
				if (provider.convertSymbols && provider.convertSymbols[symbol]) {
					symbol = provider.convertSymbols[symbol];
				}
				currencies[key.toLowerCase()] = symbol.toLowerCase();
				currencies[key.toUpperCase()] = symbol.toUpperCase();
			});
			var url = Handlebars.compile(provider.url)(currencies);
			var jsonPath = _.mapObject(provider.jsonPath, function(path) {
				return Handlebars.compile(path)(currencies)
			});
			var ajaxOptions = {
				method: 'GET',
				url: url,
				dataType: 'json',
				dataFilter: _.bind(function(data) {
					try {
						data = JSON.parse(data);
						if (jsonPath.error) {
							var error = this.getValueAtPath(data, jsonPath.error);
							if (!_.isEmpty(error)) {
								return JSON.stringify({ error: error });
							}
						}
						var result = this.getValueAtPath(data, jsonPath.data);
						if (_.isUndefined(result)) {
							return JSON.stringify({ result: null });
						}
						return JSON.stringify({ result: result });
					} catch (error) {
						return JSON.stringify({ error: error });
					}
				}, this),
			};
			return ajaxOptions;
		},
		getValueAtPath: function(data, path) {
			// Deep clone to prevent mutation of original data object.
			data = JSON.parse(JSON.stringify(data));
			var parts = path.split('.');
			var key;
			while (!_.isUndefined(data) && _.isObject(data) && parts.length > 0 && (key = parts.shift())) {
				data = data[key];
			}
			return data;
		},
		getProvider: function(providerName) {
			return this.providers[providerName] || null;
		},
		getCacheKey: function(prefix, options) {
			return prefix + JSON.stringify(_.pick(options,
				'currencies',
				'provider'
			));
		},
		providers: {
			binance: {
				label: 'Binance',
				url: 'https://api.binance.com/api/v3/ticker/price?symbol={{FROM}}{{TO}}',
				jsonPath: {
					data: 'price',
				},
				convertSymbols: {
					USD: 'USDT',
				},
			},
			bitfinex: {
				label: 'Bitfinex',
				url: 'https://api.bitfinex.com/v1/pubticker/{{from}}{{to}}',
				jsonPath: {
					error: 'message',
					data: 'last_price',
				},
			},
			bitflyer: {
				label: 'bitFlyer',
				url: 'https://api.bitflyer.com/v1/ticker?product_code={{FROM}}_{{TO}}',
				jsonPath: {
					error: 'error_message',
					data: 'ltp',
				},
			},
			bitstamp: {
				label: 'Bitstamp',
				url: 'https://www.bitstamp.net/api/v2/ticker/{{from}}{{to}}/',
				jsonPath: {
					error: 'message',
					data: 'last',
				},
			},
			coinbase: {
				label: 'Coinbase',
				url: 'https://api.coinbase.com/v2/exchange-rates?currency={{FROM}}',
				jsonPath: {
					error: 'errors',
					data: 'data.rates.{{TO}}',
				},
			},
			coinmate: {
				label: 'CoinMate.io',
				url: 'https://coinmate.io/api/ticker?currencyPair={{FROM}}_{{TO}}',
				jsonPath: {
					error: 'errorMessage',
					data: 'data.last',
				},
			},
			kraken: {
				label: 'Kraken',
				url: 'https://api.kraken.com/0/public/Ticker?pair={{FROM}}{{TO}}',
				convertSymbols: {
					BTC: 'XBT',
				},
				jsonPath: {
					error: 'error',
					data: 'result.X{{FROM}}Z{{TO}}.c.0',
				},
			},
			poloniex: {
				label: 'Poloniex',
				url: 'https://poloniex.com/public?command=returnTicker',
				convertSymbols: {
					USD: 'USDT',
				},
				jsonPath: {
					data: '{{TO}}_{{FROM}}.last',
				},
			},
		},
	};

	return service;

})();
