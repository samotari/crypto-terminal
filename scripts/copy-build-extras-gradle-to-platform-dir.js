#!/usr/bin/env node

module.exports = function(context) {
	var Q = context.requireCordovaModule('q');
	var deferral = new Q.defer();
	setTimeout(function() {
		var fs = require('fs');
		var path = require('path');
		var srcFilePath = path.join(__dirname, '..', 'build-extras.gradle');
		var destFilePath = path.join(__dirname, '..', 'platforms', 'android', 'build-extras.gradle');
		var readStream = fs.createReadStream(srcFilePath);
		var writeStream = fs.createWriteStream(destFilePath);
		readStream.pipe(writeStream);
		writeStream.on('error', function(error) {
			deferral.reject(error);
		}).on('finish', function() {
			deferral.resolve();
		});
	}, 0);
	return deferral.promise;
};
