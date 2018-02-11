'use strict';

module.exports = function(grunt) {

	var _ = require('underscore');
	var async = require('async');
	var fs = require('fs');
	var path = require('path');

	var htmlDir = path.join(__dirname, '..', 'html');
	var indexHtmlFilePath = path.join(__dirname, '..', 'index.html');
	var pkg = require('../package.json');

	grunt.registerMultiTask('compileHtml', function() {

		var done = this.async();
		var files = this.files;

		prepareData(function(error, data) {

			if (error) {
				return done(error);
			}

			async.each(files, function(file, next) {
				try {
					var template = _.template(grunt.file.read(file.src));
					var html = template(data);
					grunt.file.write(file.dest, html);
				} catch (error) {
					return next(error);
				}
				grunt.log.ok('Created new file: ' + file.dest.bold);
				next();
			}, done);
		});
	});

	var prepareData = function(cb) {

		async.parallel({
			htmlFiles: loadContents.bind(undefined, htmlDir),
		}, function(error, results) {

			if (error) {
				return cb(error);
			}

			try {
				var data = {
					name: pkg.name,
					description: pkg.description,
					version: pkg.version,
					html: prepareContents(results.htmlFiles),
				};
			} catch(error) {
				return cb(error);
			}
			cb(null, data);
		});
	};

	var prepareContents = function(results) {

		return _.object(_.map(results, function(result) {
			var key = prepareKey(result);
			if (_.isArray(result)) return [key, prepareContents(result)];
			return [key, {
				key: key,
				content: result.content,
			}];
		}));
	};

	var prepareKey = function(result) {

		var key = _.isArray(result) ? path.dirname(result[0].file) : result.file;
		key = path.basename(key);
		// Strip file extension:
		key = key.split('.')[0];
		return key;
	};

	var loadContents = function(dir, cb) {

		fs.readdir(dir, function(error, files) {
			async.map(files, function(file, next) {
				var filePath = path.join(dir, file);
				fs.stat(filePath, function(error, stat) {
					if (error) return next(error);
					if (stat.isDirectory()) return loadContents(filePath, next);
					fs.readFile(filePath, function(error, buffer) {
						if (error) return next(error);
						next(null, {
							file: filePath,
							content: buffer.toString(),
						});
					});
				});
			}, function(error, results) {
				if (error) return cb(error);
				// Remove empty results:
				results = _.compact(results);
				cb(null, results);
			});
		});
	};
};
