var app = app || {};

app.exportPayments = (function() {

	'use strict';

	function getPayReqFields() {
		var model = new app.models.PaymentRequest();
		return _.chain(model.defaults()).keys().without('data', 'uri').value();

	}

	function getCsvHeaders() {
		var csvHeaders = getPayReqFields();
		return _.map(csvHeaders, function(header) {
			return app.i18n.t('payment-history.export.' + header);
		})
	}

	function paymentToCsv(paymentRequest) {
		var payReqFields = getPayReqFields();

		return _.map(payReqFields, function(field) {
			if (field === 'timestamp') {
				return app.util.formatDate(paymentRequest[field]);
			}
			return paymentRequest[field];
		})
	}

	function writeFile(dir, fileName, blob, cb) {
		dir.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
			fileEntry.createWriter(function(fileWriter) {
				fileWriter.onwriteend = function() {
					cb(null, { fileName: fileEntry.name });
				};
				fileWriter.onerror = function(error) {
					cb(error);
				};
				fileWriter.write(blob);
			});
		}, function(error) {
			cb(error);
		});
	}

	function convertToCsv(paymentRequests) {

		app.log('exportPayments.converToCsv');
		var csvHeaders = getCsvHeaders();
		var csv = _.reduce(paymentRequests || [], function(memo, paymentRequest) {
			return memo + '\n' + paymentToCsv(paymentRequest).join(',');
		}, csvHeaders.join(','));

		return csv;
	}

	function writePaymentsAsCsvBlob(history) {

		var data = convertToCsv(history);

		return new Blob([data], {
			'type': 'text/csv;charset=utf8;',
		});
	}

	/*
		Writes the content of the history as CSV into a file that is created in the user's download folder.
		It works for Android, in order to work with IOS it needs cordova-plugin-device and change the storagePath.

		see https://stackoverflow.com/questions/43575581/cordova-download-a-file-in-download-folder
	 */
	function writePaymentsAsCsvFileInCordova(history, fileName, cb) {

		var blob = writePaymentsAsCsvBlob(history);
		var storagePath = app.config.paymentHistory.export.storagePath;
		var storageDirectory = app.config.paymentHistory.export.storageDirectory;

		if (!storagePath || !storageDirectory) {
			return cb(new Error('Cannot resolve download directory'));
		}

		window.resolveLocalFileSystemURL(storagePath, function(dir) {
			dir.getDirectory(storageDirectory, { create: false }, function(downloadDir) {
				writeFile(downloadDir, fileName, blob, cb);
			})
		}, function(error) {
			if (error) return cb(error);
		});

	}

	function writePaymentsAsCsvFileInBrowser(history, cb) {

		var data = convertToCsv(history);

		var uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(data);
		window.open(uri);

		_.defer(cb)
	}

	function exportPaymentDetails(cb) {

		app.log('exportPayments.exportPaymentDetails');
		var today = app.util.formatDate(new Date(), 'DD-MM-YYYY_HHmmss');
		var fileExtension = app.config.paymentHistory.export.extension;
		var fileName = app.config.paymentHistory.export.fileName + '-' + today + fileExtension;

		var paymentsHistory =_.filter(_.map(app.paymentRequests.models, function(model) {
			return model.attributes;
		}));

		var done = function(error) {

			if (error) {
				return cb(error);
			}

			cb();
		}

		if (app.isCordova()) {
			writePaymentsAsCsvFileInCordova(paymentsHistory, fileName, done);
		} else {
			writePaymentsAsCsvFileInBrowser(paymentsHistory, done);
		}

	}

	return {
		exportPaymentDetails: exportPaymentDetails,
		getCsvHeaders: getCsvHeaders,
		getPayReqFields: getPayReqFields
	}
})();