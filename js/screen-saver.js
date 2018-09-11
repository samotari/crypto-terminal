var app = app || {};

app.screenSaver = (function() {

	'use strict';

	app.onReady(function() {

		app.screenSaver.initialize();

	});

	return {

		screenSaverActive: false,

		initialize: function() {

			this.startTimer();

			$(document).click(_.bind(this.resetTimer, this));
		},

		resetTimer: function() {

			clearTimeout(this.mouseTimeOut);

			if (this.screenSaverActive) {
				this.hideScreenSaver();
			}

			this.startTimer();
		},

		startTimer: function() {

			this.mouseTimeOut = setTimeout(_.bind(function(){
				this.showScreenSaver();
			}, this), app.config.screenSaver.idleTime);
		},

		showScreenSaver: function() {

			$('html').addClass('screen-saver-on');
			this.screenSaverActive = true;
		},

		hideScreenSaver: function() {

			$('html').removeClass('screen-saver-on');
			this.screenSaverActive = false;
		}

	};

})();
