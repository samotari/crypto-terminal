var app = app || {};

app.sound = (function() {

	'use strict';

	var sound = {

		loaded: {},

		tracks: [
			{
				name: 'pay-success-01',
				src: [
					{
						url: 'sounds/pay-success-01.ogg',
						type: 'audio/ogg',
					},
					{
						url: 'sounds/pay-success-01.mp3',
						type: 'audio/mp3',
					},
				],
			},
		],

		preloadAll: function(done) {

			done = done || _.noop;
			async.each(this.tracks, this.preloadTrack, done);
		},

		preloadTrack: function(track, done) {

			done = done || _.noop;
			done = _.once(done);

			if (!app.isCordova()) {
				this.preloadTrackForBrowser(track, done);
			} else if (app.isAndroid()) {
				this.preloadTrackForMobile(track, done);
			}
		},

		preloadTrackForMobile: function(track, done) {

			done = done || _.noop;

			if (!window.plugins || !window.plugins.NativeAudio) {
				return _.defer(done, new Error('Cannot play audio track: Missing NativeAudio plugin'));
			}

			var src = this.findTrackSourceByType(track.name, 'audio/mp3');

			if (!src) {
				return _.defer(done, new Error('Cannot play audio track: Must be available as mp3'));
			}

			var volume = 1;
			var voice = 1;
			var delay = 0;

			/*
				Using preloadComplex here because our audio tracks are "too complicated". See:
				https://stackoverflow.com/questions/41569656/phonegap-nativeaudio-will-not-play-on-ios?rq=1
			*/
			window.plugins.NativeAudio.preloadComplex(track.name, src.url, volume, voice, delay, _.bind(function() {
				app.log('NativeAudio.preloadComplex.success', track, arguments);
				try {
					this.loaded[track.name] = _.extend({}, track, {
						play: function() {
							window.plugins.NativeAudio.play(track.name, function() {
								app.log('NativeAudio.play.success', track, arguments);
							}, function() {
								app.log('NativeAudio.play.error', track, arguments);
							});
						},
					});
				} catch (error) {
					app.log(error);
				}
			}, this), function(error) {
				app.log('NativeAudio.preloadComplex.error', track, arguments);
				done(new Error(error));
			});
		},

		findTrackByName: function(name) {

			return _.findWhere(this.tracks, { name: name });
		},

		findTrackSourceByType: function(name, type) {

			var track = this.findTrackByName(name);
			return track && _.find(track.src, function(src) {
				return src.type === type;
			});
		},

		preloadTrackForBrowser: function(track, done) {

			done = done || _.noop;

			var $audio = $('<audio/>', { preload: 'auto' });

			_.each(track.src, function(src) {
				var $source = $('<source/>', {
					src: src.url,
					type: src.type,
				});
				$audio.append($source);
			});

			/*
				See:
				https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
			*/
			$audio.one('canplaythrough', _.bind(function() {
				// Track is ready to be played.
				this.loaded[track.name] = _.extend({}, track, {
					play: function() {
						$audio[0].play();
					},
				});
				done();
			}, this));

			$audio.one('error', done);

			$('body').append($audio);
		},

		play: function(name) {

			// Don't play tracks if in-app audio is disabled.
			if (!this.inAppAudio()) return;

			if (this.isLoaded(name)) {
				var track = this.getLoadedTrack(name);
				track.play();
			}
		},

		inAppAudio: function() {

			return app.settings.get('inAppAudio') === true;
		},

		isLoaded: function(name) {

			return !!this.getLoadedTrack(name);
		},

		getLoadedTrack: function(name) {

			return this.loaded[name] || null;
		},
	};

	_.bindAll(sound, 'preloadAll', 'preloadTrack');

	app.queues.onReady.push({
		fn: sound.preloadAll
	});

	return sound;

})();
