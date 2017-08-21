'use strict';

module.exports = function(grunt) {

	var _ = require('underscore');
	var selenium = require('selenium-standalone');

	var checkInstalledFiles = [
		'node_modules/selenium-standalone/.selenium/chromedriver',
		'node_modules/selenium-standalone/.selenium/geckodriver',
		'node_modules/selenium-standalone/.selenium/selenium-server'
	];

	var config = {
		drivers: {
			chrome: {
				version: '2.30',
				arch: process.arch,
				baseURL: 'https://chromedriver.storage.googleapis.com'
			},
			firefox: {
				version: '0.17.0',
				arch: process.arch,
				baseURL: 'https://github.com/mozilla/geckodriver/releases/download'
			}
		}
	};

	grunt.registerTask('selenium', function(action) {

		var done = this.async();

		switch (action) {

			case 'install':
				return install(done);

			case 'start':
				return install(function(error) {
					if (error) return done(error);
					start(done);
				});

			case 'stop':
				return stop(done);

			// For `grunt selenium`.
			// This task starts the local selenium server and then waits.
			default:
				return install(function(error) {
					if (error) return done(error);
					start(function(error) {
						if (error) return done(error);
						grunt.log.writeln('Selenium started');
						grunt.log.writeln('Exit this process ' + '[CTRL+C]'['white'].bold + ' to stop selenium');
						// Never call done.
						// This allows selenium to continue running until the grunt process is killed.
					});
				});
		}
	});

	var installed = (function() {
		return _.every(checkInstalledFiles, function(file) {
			return grunt.file.exists(file);
		});
	})();

	var childProcess;

	function start(cb) {
		grunt.log.writeln('Starting selenium..');
		selenium.start(config, function(error, child) {
			if (error) return cb(error);
			childProcess = child;
			cb();
		});
	}

	function stop(cb) {
		if (childProcess) childProcess.kill();
		cb();
	}

	function install(cb) {
		if (installed) return cb();
		grunt.log.writeln('Installing selenium..');
		installed = true;
		selenium.install(config, cb);
	}
};
