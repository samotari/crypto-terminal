var app = app || {};

app.util = (function() {

	'use strict';

	return {

		extend: function() {

			var args = Array.prototype.slice.call(arguments);
			return _.extend.apply(_, [{}].concat(args));
		},

		generateRandomString: function(length, charset) {

			var randString = '';

			charset = charset || 'abcdefghijklmnopqrstuvqxyzABCDEFGHIJKLMNOPQRSTUVQXYZ1234567890';

			var randomValues = app.util.getRandomValues(length);

			for (var index = 0; index < length; index++) {
				randString += charset[randomValues[index] % charset.length];
			}

			return randString;
		},

		getRandomValues: function(length) {

			var randomValues;

			if (window.crypto && window.crypto.getRandomValues) {
				// For the latest browsers.
				randomValues = new Uint32Array(length);
				window.crypto.getRandomValues(randomValues);
			} else {
				// Fallback to using the SJCL library.
				randomValues = sjcl.random.randomWords(length);
			}

			return randomValues;
		},

		requestFactory: function(requestFn, requestObj) {

			return function(callback) {

				async.retry(app.config.retryRequest, function(retryCallback) {

					requestFn(requestObj, retryCallback);

				}, function(error, results) {

					if (error) {
						callback(error);
					} else {

						setTimeout(function() {

							callback(null, results);

						}, app.config.httpRequests.timeBetweenRequests)
					}

				})
			}

		},

		requestArrFactory : function(fnArr, requestObj) {

			return _.map(fnArr, function(fn) {
				return app.util.requestFactory(fn, requestObj);
			});
		}

	};

})();
