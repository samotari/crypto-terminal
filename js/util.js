var app = app || {};

app.util = (function() {

	'use strict';

	return {

		extend: function() {
			var args = Array.prototype.slice.call(arguments);
			return _.extend.apply(_, [{}].concat(args));
		},

		renderQrCode: function($target, data, options, cb) {

			if (_.isFunction(options)) {
				cb = options;
				options = null;
			}

			options = options || {};

			app.util.generateQrCodeDataUri(data, options, function(error, dataUri) {

				if (error) {
					return cb && cb(error);
				}

				window.requestAnimationFrame(function() {

					var css = {
						'background-image': 'url(' + dataUri + ')',
						'background-repeat': 'no-repeat',
						'background-position': 'center center',
					};

					if (options.width) {
						css['background-size'] = [
							options.width + 'px',
							options.width + 'px'
						].join(' ');
					}

					$target.css(css);
					cb && cb();
				});
			});
		},

		generateQrCodeDataUri: function(data, options, cb) {

			if (_.isFunction(options)) {
				cb = options;
				options = null;
			}

			options = _.defaults(options || {}, {
				errorCorrectionLevel: app.config.qrCodes.errorCorrectionLevel,
				margin: app.config.qrCodes.margin,
				type: 'image/jpeg',
				rendererOpts: {
					quality: 1,
				},
			});

			QRCode.toDataURL(data, options, cb);
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
