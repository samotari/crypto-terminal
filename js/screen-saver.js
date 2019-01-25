var app = app || {};

app.screenSaver = (function() {

	'use strict';

	app.onReady(function() {
		app.screenSaver.initialize();
	});

	return {

		idleTimeout: null,

		initialize: function() {

			_.bindAll(this,
				'pause',
				'reset',
				'resume',
				'show',
				'toggle'
			);
			$(document).click(this.reset);
			app.on('busy', this.pause);
			app.on('notBusy', this.resume);
			app.settings.on('change:screenSaver', this.toggle);
			this.toggle();
		},

		toggle: function() {

			if (this.isActive()) {
				this.resume();
			} else {
				this.pause();
			}
		},

		pause: function() {

			this.hide();
			this.stopTimer();
		},

		resume: function() {

			if (this.isActive()) {
				this.startTimer();
			}
		},

		reset: function() {

			this.pause();
			this.resume();
		},

		stopTimer: function() {

			clearTimeout(this.idleTimeout);
		},

		startTimer: function() {

			this.idleTimeout = setTimeout(this.show, app.config.screenSaver.idleTime);
		},

		show: function() {

			$('#cover-text').text(app.i18n.t('screen-saver.instructions'));
			$('html').addClass('screen-saver-on');
		},

		hide: function() {

			$('html').removeClass('screen-saver-on');
			$('#cover-text').text('');
		},

		isActive: function() {

			return app.settings.get('screenSaver') === true;
		},

	};

})();
