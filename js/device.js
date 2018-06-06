var app = app || {};

app.device = (function() {

	'use strict';

	return {

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

		overrideBackButton: function() {

			if (app.isCordova()) {
				document.addEventListener('backbutton', function() {
					var currentView = app.mainView.currentView;
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

		listenToNetworkInformation: function() {
			// https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-network-information/

			function onOffline() {
				$('html').addClass('offline');
			}

			function onOnline() {
				$('html').removeClass('offline');
			}

			if (app.isCordova()) {
				document.addEventListener("offline", onOffline, false);
				document.addEventListener("online", onOnline, false);
			}
		}

	};

})();
