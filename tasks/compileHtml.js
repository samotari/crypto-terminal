'use strict';

module.exports = function(grunt) {

	var _ = require('underscore');
	var async = require('async');
	var fs = require('fs');
	var path = require('path');

	var pkg = require('../package.json');
	var target = process.env.TARGET || 'prod';
	var config = require('../config')[target];
	var templateData = {
		config: config,
		target: target,
		info: _.extend({}, _.pick(pkg,
			'author',
			'contributors',
			'description',
			'homepage',
			'version'
		), {
			name: pkg.app.name,
		}),
	};

	grunt.registerMultiTask('compileHtml', function() {

		var done = this.async();
		var files = this.files;
		var options = _.defaults(this.options(), {});

		prepareData(options, function(error, data) {

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

	var deepExtend = function(target, source) {
		for (var prop in source) {
			if (prop in target) {
				deepExtend(target[prop], source[prop]);
			} else {
				target[prop] = source[prop];
			}
		}
		return target;
	};

	var prepareData = function(options, cb) {

		var fns = _.object(_.map(options.htmlDirs, function(htmlDir) {
			return [htmlDir, loadContents.bind(undefined, htmlDir)];
		}));

		async.parallel(fns, function(error, results) {

			if (error) {
				return cb(error);
			}

			try {
				results = _.mapObject(results, function(result, htmlDir) {
					return prepareContents(result);
				});
				var html = _.reduce(results, function(result, memo) {
					return deepExtend(memo, result)
				}, {});
				var data = _.extend({}, templateData, {
					html:  html,
				});
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
			var template = _.template(result.content);
			var content = template(templateData);
			return [key, {
				key: key,
				content: content,
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
