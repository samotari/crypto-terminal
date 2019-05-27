var app = app || {};

app.screenSaver = (function() {

	'use strict';

	app.onReady(function() {
		if (app.isConfigured() && app.hasCompletedGettingStarted()) {
			app.screenSaver.initialize();
		}
	});

	return {

		idleTimeout: null,
		disabled: true,

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
			this.$screenSaver = $('#screen-saver');
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
			this.idleTimeout = null;
		},

		startTimer: function() {

			this.idleTimeout = setTimeout(this.show, app.config.screenSaver.idleTime);
		},

		show: function() {

			this.renderView();
			$('html').addClass('screen-saver-on');
		},

		hide: function() {

			$('html').removeClass('screen-saver-on');
			this.closeView();
		},

		renderView: function() {

			if (!this.$screenSaver) return;
			var View = app.views.ScreenSaver;
			var view = this.view = new View();
			var $el = $('<div/>', {
				class: 'view'
			});
			if (View.prototype.className) {
				$el.addClass(View.prototype.className);
			}
			this.$screenSaver.empty().append($el);
			view.setElement($el).render();
		},

		closeView: function() {

			if (this.view) {
				this.view.close();
			}
			if (this.$screenSaver) {
				this.$screenSaver.empty();
			}
		},

		isActive: function() {

			return app.settings.get('screenSaver') === true && !this.isDisabled();
		},

		isDisabled: function() {

			return this.disabled === true;
		},

		disable: function() {

			this.disabled = true;
		},

		enable: function() {

			this.disabled = false;
		},

	};

})();
