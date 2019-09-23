var app = app || {};

app.device = (function() {

	'use strict';

	var device = _.extend({}, {

		offline: false,

		initialize: function() {

			_.bindAll(this,
				'onBackButton'
			);

			if (app.isCordova()) {

				window.addEventListener('keyboardWillShow', function() {
					$('html').addClass('keyboard-visible');
					device.trigger('keyboard:visible');
				}, false);

				window.addEventListener('keyboardWillHide', function() {
					$('html').removeClass('keyboard-visible');
					device.trigger('keyboard:hidden');
				}, false);

				document.addEventListener('backbutton', this.onBackButton, false);
			}
		},

		onBackButton: function() {

			// Don't do extra back-button behavior when scanning with camera.
			if (this.isScanningWithCamera()) return;

			var currentView = app.mainView.currentView && app.mainView.currentView.view;
			if (currentView && currentView.onBackButton) {
				// Use current view's custom back button behavior, if defined.
				currentView.onBackButton();
			} else {
				// Otherwise, use browser history to go back.
				Backbone.history.history.back();
			}
		},

		scanning: false,

		isScanningWithCamera: function() {

			return this.scanning === true;
		},

		scanQRCodeWithCamera: function(options, cb) {

			if (_.isFunction(options)) {
				cb = options;
				options = null;
			}

			if (!app.isCordova()) {
				_.defer(cb, new Error(app.i18n.t('device.camera.not-available')));
				return;
			}

			options = _.defaults(options || {}, {
				preferFrontCamera: false,// iOS and Android
				showFlipCameraButton: false,// iOS and Android
				showTorchButton: false,// iOS and Android
				torchOn: false,// Android, launch with the torch switched on (if available)
				prompt: '',// Android
				resultDisplayDuration: 0,// Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
				formats: 'QR_CODE',// default: all but PDF_417 and RSS_EXPANDED
				// orientation: 'landscape',// Android only (portrait|landscape), default unset so it rotates with the device
				disableAnimations: true,// iOS
				disableSuccessBeep: true,// iOS and Android
			});

			// Use a flag to know when we are scanning with the camera.
			this.scanning = true;
			var done = _.once(_.bind(function() {
				// Wait before unsetting the scanning flag.
				// To prevent the back event in the camera plugin from triggering navigation.
				_.delay(_.bind(function() {
					this.scanning = false;
				}, this), 500);
				cb.apply(undefined, arguments);
			}, this));

			cordova.plugins.barcodeScanner.scan(function onSuccess(result) {
				done(null, result.text);
			}, function onError(error) {
				done(error);
			}, options);
		},

	}, Backbone.Events);

	document.addEventListener('offline', function() {
		device.offline = true;
	}, false);

	document.addEventListener('online', function() {
		device.offline = false;
	}, false);

	app.onDeviceReady(function() {
		if (app.isCordova()) {
			// Detect initial offline state.
			var state = navigator && navigator.connection && navigator.connection.type || null;
			device.offline = !state || state === Connection.UNKNOWN || state === Connection.NONE;
		}
	});

	return device;

})();
