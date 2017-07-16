'use strict';

module.exports = function(grunt) {

	var _ = require('underscore');
	var async = require('async');
	var browserify = require('browserify');
	var babelify = require('babelify');

	grunt.registerMultiTask('browserify', function() {

		var done = this.async();
		var options = this.options();

		async.each(this.files, function(file, next) {

			var srcFiles = grunt.file.expand(file.src);
			var b = browserify(srcFiles, options);

			b.bundle(function(error, buffer) {

				if (error) {
					return next(error);
				}

				grunt.file.write(file.dest, buffer.toString());
				next();
			});

		}, done);
	});
};
