var app = app || {};

app.device = (function() {

	'use strict';

	return {

		scanBarcodeWithCamera: function(options, cb) {

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
				showFlipCameraButton: true,// iOS and Android 
				showTorchButton: true,// iOS and Android 
				torchOn: false,// Android, launch with the torch switched on (if available) 
				prompt: 'Place a barcode inside the scan area',// Android 
				resultDisplayDuration: 0,// Android, display scanned text for X ms. 0 suppresses it entirely, default 1500 
				formats: 'QR_CODE',// default: all but PDF_417 and RSS_EXPANDED 
				// orientation: 'landscape',// Android only (portrait|landscape), default unset so it rotates with the device 
				disableAnimations: true,// iOS 
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
		}

	};

})();
