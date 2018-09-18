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
				'hide',
				'resetTimer',
				'show'
			);
			this.startTimer();
			$(document).click(this.resetTimer);
		},

		resetTimer: function() {

			clearTimeout(this.idleTimeout);
			this.hide();
			this.startTimer();
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

	};

})();
