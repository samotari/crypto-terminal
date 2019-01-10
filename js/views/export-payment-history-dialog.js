var app = app || {};

app.views = app.views || {};

app.views.exportPaymentHistoryDialog = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'export-payment-history-dialog',

		template: '#template-export-payment-history-dialog',

		events: {
			'click .cancel': 'onCancel',
			'click .download': 'onDownload',
			'keyup #export-payment-history-dialog-fileName': 'onFileNameInputKeyup'
		},

		settings: [
			{
				name: 'fileName',
				id: 'export-payment-history-dialog-fileName',
				label: function() {
					return app.i18n.t('payment-history.export.dialog.fileName-label')
				},
				type: 'text',
				required: true,
				value: function() {
					var today = app.util.formatDate(new Date(), app.config.paymentHistory.export.dateFormat);
					var fileExtension = app.config.paymentHistory.export.extension;
					var defaultFileName = app.i18n.t('payment-history.export.dialog.default-file-name') + '-' + today + fileExtension;
					return defaultFileName;
				}
			}
		],

		initialize: function() {

			this.render().$el.appendTo($('body'));
			this.preparePaymentHistory();
			var settingFileName = _.findWhere(this.settings, {name: 'fileName'});
			var defaultFileName = _.result(settingFileName, 'value');
			this.setFileName(defaultFileName);
		},

		serializeData: function() {

			return {
				title: this.options.title,
				settings: this.settings
			}
		},

		getPaymentHistory: function() {

			return app.paymentRequests.toJSON();
		},

		preparePaymentHistory: function() {

			var data = this.getPaymentHistory();
			var csvData = app.util.toCsv(data);
			var dataUri = 'data:text/csv;base64,' + Buffer.from(csvData).toString('base64');
			this.$('.secondary-control.button.download').attr('href', dataUri);
		},

		onFileNameInputKeyup: function(evt) {

			var fileName = evt.target.value;
			this.setFileName(fileName);
		},

		setFileName: function(fileName) {
			this.fileName = fileName;
			this.$('.secondary-control.button.download').attr("download", fileName);
		},

		onDownload: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			/**
				When running in browser, html anchor native download is used,
				but the view should still be closed.
			 */
			if (!app.isAndroid()) {
				_.defer(this.close);
				return;
			}

			var paymentHistory = this.getPaymentHistory();

			app.busy(true);
			this.writeFileInAndroid(paymentHistory, this.fileName, _.bind(function(error) {
				app.busy(false);
				if (error) {
					app.log(error);
					return app.mainView.showMessage(app.i18n.t('payment-history.export.fail'));
				}

				app.mainView.showMessage(app.i18n.t('payment-history.export.success'));
				this.close();
			}, this));
		},

		onCancel: function(evt) {

			this.close();
		},

		writeFile: function(dir, fileName, blob, cb) {

			dir.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
				fileEntry.createWriter(function(fileWriter) {
					fileWriter.onwriteend = function() {
						cb(null);
					};
					fileWriter.onerror = function(error) {
						cb(error);
					};
					fileWriter.write(blob);
				});
			}, function(error) {
				cb(error);
			});
		},

		writePaymentsAsCsvBlob: function(history) {

			var data = app.util.toCsv(history);

			return new Blob([data], {
				'type': 'text/csv;charset=utf8;',
			});
		},

		/*
			Writes the content of the history as CSV into a file that is created in the user's download folder.
			It works for Android, in order to work with IOS it needs cordova-plugin-device and change the storagePath.
			see https://stackoverflow.com/questions/43575581/cordova-download-a-file-in-download-folder
		 */
		writeFileInAndroid: function(paymentHistory, fileName, cb) {

			var blob = this.writePaymentsAsCsvBlob(paymentHistory);
			var storagePath = app.config.paymentHistory.export.storagePath;
			var storageDirectory = app.config.paymentHistory.export.storageDirectory;

			if (!storagePath || !storageDirectory) {
				return cb(new Error('Cannot resolve download directory'));
			}

			window.resolveLocalFileSystemURL(storagePath, _.bind(function(dir) {
				dir.getDirectory(storageDirectory, { create: false }, _.bind(function(downloadDir) {
					this.writeFile(downloadDir, fileName, blob, cb);
				}, this));
			}, this), function(error) {
				cb(error);
			});
		},
	});

})();