var app = app || {};

app.util = (function() {

	'use strict';

	return {

		extend: function() {

			var args = Array.prototype.slice.call(arguments);
			return _.extend.apply(_, [{}].concat(args));
		},

		getErrorMessageFromJQueryXHRObject: function(jqXHR) {

			if (jqXHR.responseJSON && jqXHR.responseJSON.error) {
				return jqXHR.responseJSON.error;
			} else if (jqXHR.status) {
				return jqXHR.statusText;
			} else if (jqXHR.status === 0) {
				return 'Most likely your device is offline';
			}
			return 'Unknown';
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

		formatNumber: function(number, format) {

			if (!number) return '';
			format = format || 'default';
			var config = this.getNumberFormatConfig(format);
			BigNumber.config(config.BigNumber);
			try {
				number = (new BigNumber(number)).toFormat(config.decimals);
			} catch (error) {
				app.log(error);
				return '';
			}
			return number;
		},

		getNumberFormatConfig: function(format) {

			return _.defaults(app.config.numberFormats[format] || {}, app.config.numberFormats['default']);
		},

		formatDate: function(datetime, format) {

			format = format || app.settings.get('dateFormat');
			return moment(datetime).format(format);
		},

		getSupportedDisplayCurrencies: function() {

			var fromExchangeRates = _.keys(app.cache.get('exchange-rates') || []);
			return _.uniq([].concat(app.config.primaryDisplayCurrencies, fromExchangeRates));
		},

		toCsv: function(data) {
			data = data || [];

			if (_.isEmpty(data)) {
				return '';
			}

			var headers = Object.keys(data[0]).join(',');
			return [headers].concat(_.map(data, function(item) {
				return _.map(item, function(value) {
					if (_.isObject(value)) {
						value = JSON.stringify(value);
					} else if (_.isNumber(value)) {
						value = value.toString();
					} else if (!_.isString(value)) {
						value = '';
					}
					return value.replace(/\n|,/gm, '');
				}).join(',');
			})).join('\n');
		}

	};

})();
