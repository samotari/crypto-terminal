var app = app || {};

app.onDeviceReady(function() {

	'use strict';

	function doWriteFile(data, success, error) {
		return function(fileEntry) {
			fileEntry.createWriter(function (fileWriter) {
				fileWriter.onwriteend = function () {
					success();
				};

				fileWriter.onerror = function (e) {
					error(e);
				};

				fileWriter.write(new Blob([data], {type: 'text/plain'}));
			});
		}
	}

	app.writeFile = function(name, data, success, error) {
		if (!app.fs) {
			error();
		} else {
			if (app.isCordova()) {
				window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (dir) {
					dir.getFile(name, {create: true}, doWriteFile(data, success, error));
				});
			} else {
				app.fs.root.getFile(name, {create: true}, doWriteFile(data, success, error));
			}
		}
	};

	app.queues.onStart.push({
		fn: function(done) {
			var size = 5 * 1024 * 1024 /* 5MB */;
			var requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
			var storageInfo = navigator.webkitPersistentStorage;
			var PERSISTENT = window.PERSISTENT || LocalFileSystem.PERSISTENT;

			storageInfo.requestQuota(size, function(grantedBytes) {
				requestFileSystem(PERSISTENT, grantedBytes, function (fs) {
					app.fs = fs;
					done();
				}, function () {
					console.error("Fail to request file system");
					done();
				});
			}, function () {
				console.error("Fail to request quota");
				done();
			});
		},
	});
});
