var app = app || {};

app.device = (function() {

	'use strict';

	var device = _.extend({}, {

		initialize: function() {

			if (app.isCordova()) {

				window.addEventListener('keyboardWillShow', function() {
					$('html').addClass('keyboard-visible');
					device.trigger('keyboard:visible');
				}, false);

				window.addEventListener('keyboardWillHide', function() {
					$('html').removeClass('keyboard-visible');
					device.trigger('keyboard:hidden');
				}, false);

				// https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-network-information/
				document.addEventListener('offline', function() {
					$('html').addClass('offline');
					device.trigger('offline');
				}, false);

				document.addEventListener('online', function() {
					$('html').removeClass('offline');
					device.trigger('online');
				}, false);

				document.addEventListener('backbutton', function() {
					var currentView = app.mainView.currentView && app.mainView.currentView.view;
					if (currentView && currentView.onBackButton) {
						// Use current view's custom back button behavior, if defined.
						currentView.onBackButton();
					} else {
						// Otherwise, use browser history to go back.
						Backbone.history.history.back();
					}
				}, false);
			}
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

			var onError = _.once(cb);
			var onSuccess = _.once(function(result) {
				cb(null, result.text);
			});

			cordova.plugins.barcodeScanner.scan(onSuccess, onError, options);
		},

	}, Backbone.Events);

	return device;

})();
