var app = app || {};

app.util = (function() {

	'use strict';

	return {
		extend: function() {
			var args = Array.prototype.slice.call(arguments);
			return _.extend.apply(_, [{}].concat(args));
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
			})
		}

	};

})();
