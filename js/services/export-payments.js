var app = app || {};

app.services = app.services || {};

app.services.exportPayments = (function() {

	'use strict';

	var csvHeaders = [
		'status',
		'amount',
		'display currency',
		'payment method',
		'payment method rate',
		'address',
		'date',
	];

	function paymentToCsv(paymentRequest) {
		return [
			paymentRequest.status,
			paymentRequest.amount,
			paymentRequest.currency,
			paymentRequest.method,
			paymentRequest.rate,
			paymentRequest.uri,
			new Date(paymentRequest.timestamp)
		];
	}

	function writeFile(dir, fileName, blob, cb) {
		dir.getFile(fileName, {create: true, exclusive: false}, function (fileEntry) {
			fileEntry.createWriter(function (fileWriter) {
				fileWriter.onwriteend = function () {
					cb(null, { fileName: fileEntry.name });
				};
				fileWriter.onerror = function (e) {
					cb(e, null);
				};
				fileWriter.write(blob);
			});
		}, function (e) {
			cb(e, null);
		});
	}

	return {

		convertToCsv: function(paymentRequests) {

			var csv = _.reduce(paymentRequests || [], function (memo, paymentRequest) {
				return memo + '\n' + paymentToCsv(paymentRequest).join(',');
			}, csvHeaders.join(','));

			return csv;
		},

		writePaymentsAsCsvBlob: function(history) {

			var data = this.convertToCsv(history);

			return new Blob([data], {
				'type': 'text/csv;charset=utf8;',
			});
		},

		/*
			Writes the content of the history as CSV into a file that is created in the user's download folder.
			It works for Android, in order to work with IOS it needs cordova-plugin-device and change the storagePath.

			see https://stackoverflow.com/questions/43575581/cordova-download-a-file-in-download-folder
		 */
		writePaymentsAsCsvFileInCordova: function(history, fileName, cb) {

			var blob = this.writePaymentsAsCsvBlob(history);
			var storagePath = app.config.paymentHistory.export.storagePath;
			var storageDirectory = app.config.paymentHistory.export.storageDirectory;

			if (!storagePath || !storageDirectory) {
				return cb(new Error('Cannot resolve download directory'));
			}

			window.resolveLocalFileSystemURL(storagePath, function(dir) {
				dir.getDirectory(storageDirectory, { create: false }, function(downloadDir) {
					writeFile(downloadDir, fileName, blob, cb);
				})
			}, function (error) {
				if (error) return cb(error);
			});

		},

		writePaymentsAsCsvFileInBrowser: function(history, fileName, cb) {

			var blob = this.writePaymentsAsCsvBlob(history);

			var a = document.createElement('a');
			a.style = 'display: none';
			a.download = fileName;
			a.href = window.URL.createObjectURL(blob);
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			// Defer the callback function so that it is async.
			_.defer(cb)
		},

		exportPaymentDetails: function() {

			var fileName = app.config.paymentHistory.export.fileName;

			var history = _.filter(_.map(this.collection.models, function (model) {
				return model.attributes;
			}));

			var done = function(error) {
				if (error) {
					return alert(app.i18n.t('payment-history.export.fail'));
				}

				alert(app.i18n.t('payment-history.export.success'));

			}

			if (!app.isCordova()) {
				this.writePaymentsAsCsvFileInBrowser(history, fileName, done);
			} else {
				this.writePaymentsAsCsvFileInCordova(history, fileName, done);
			}
		}
	}
})();