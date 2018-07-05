var app = app || {};

app.nfc = (function() {

	'use strict';

	return _.extend({}, {

		/*
			See:
			https://github.com/chariotsolutions/phonegap-nfc#nfcreadermode
		*/
		startReading: function(options, onError) {

			if (_.isFunction(options)) {
				onError = options;
				options = null;
			}

			options = options || {};

			if (!onError) {
				onError = _.noop;
			}

			var emit = _.bind(this.trigger, this);

			var waiting = this.waitUntilEnabled(options, function(error) {
				if (error) return onError(error);
				// https://developer.android.com/reference/android/nfc/NfcAdapter#enableReaderMode(android.app.Activity,%20android.nfc.NfcAdapter.ReaderCallback,%20int,%20android.os.Bundle)
				var flags = nfc.FLAG_READER_NFC_A | nfc.FLAG_READER_NO_PLATFORM_SOUNDS;
				nfc.readerMode(flags, function onRead(evt) {
					try {
						var payload = evt && evt.ndefMessage && evt.ndefMessage[0] && evt.ndefMessage[0].payload || null;
						var data = payload && nfc.bytesToString(payload).substr(1) || null;
						if (data) {
							emit('read', data);
						}
					} catch (error) {
						app.log(error);
					}
				}, onError);
			});

			return {
				cancel: function() {
					waiting.cancel();
				},
			};
		},

		stopReading: function(cb) {

			if (!cb) {
				cb = _.noop;
			}

			this.checkEnabled(function(error, isEnabled) {
				if (error) return cb(error);
				if (!isEnabled) return cb();
				nfc.disableReaderMode(function onSuccess() {
					cb();
				}, function onFailure(code) {
					cb(new Error(code));
				});
			});
		},

		waitUntilEnabled: function(options, cb) {

			if (_.isFunction(options)) {
				cb = options;
				options = null;
			}

			options = _.defaults(options || {}, {
				checkDelay: 200,
				timeout: 0,// Never
			});

			var checkEnabled = _.bind(this.checkEnabled, this);
			var enabled = false;
			var canceled = false;
			var startTime = Date.now();
			var checkTimeout;

			async.until(function() { return enabled; }, function(next) {

				checkEnabled(function(error, isEnabled, code) {

					if (error) {
						return next(error);
					}

					if (isEnabled) {
						enabled = true;
						return next();
					}

					if (code === 'NFC_DISABLED') {

						var elapsedTime = Date.now() - startTime;

						if (options.timeout && elapsedTime >= options.timeout) {
							return next(new Error(code));
						}

						if (!canceled) {
							checkTimeout = _.delay(next, options.checkDelay);
						}

					} else {
						return next(new Error(code));
					}
				});

			}, cb);

			return {
				cancel: function() {
					clearTimeout(checkTimeout);
					canceled = true;
				},
			};
		},

		checkEnabled: function(cb) {

			if (typeof nfc === 'undefined') {
				return _.defer(function() {
					cb(null, false, 'NO_NFC');
				});
			}

			nfc.enabled(function onSuccess() {
				cb(null, true);
			}, function onFailure(result) {
				cb(null, false, result);
			});
		},
	}, Backbone.Events);

})();
