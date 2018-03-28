var app = app || {};

app.views = app.views || {};

app.views.Main = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		el: 'body',

		events: {
			'touchstart': 'onTouchStart',
			'touchmove': 'onTouchMove',
			'touchend': 'onTouchEnd',
			'touchcancel': 'onTouchCancel',
			'mousedown': 'onMouseDown',
			'mousemove': 'onMouseMove',
			'mouseup': 'onMouseUp',
			'click': 'onClick',
			'quicktouch .header-button.language': 'showLanguageMenu',
			'quicktouch .header-button.more': 'showMoreMenu',
			'quicktouch #language-menu .menu-item': 'changeLanguage',
			'quicktouch a': 'onQuickTouchAnchor',
		},

		currentView: null,
		$interactTarget: null,
		interaction: null,

		initialize: function() {

			_.bindAll(this,
				'onDocumentInteraction',
				'toggleIsUnlockedFlag',
				'toggleRequirePinFlag',
				'toggleConfiguredFlag'
			);
			this.$languageMenu = this.$('#language-menu');
			this.$languageMenuToggle = this.$('.header-button.language');
			this.$moreMenu = this.$('#more-menu');
			this.$moreMenuToggle = this.$('.header-button.more');
			this.$view = this.$('#view');
			this.$message = this.$('#message');
			this.$messageContent = this.$('#message-content');
			this.initializeLanguageMenu();
			this.initializeMoreMenu();
			this.updateLanguageToggle();
			this.reRenderView();
			$(document).on('click quicktouch', this.onDocumentInteraction);
			this.listenTo(app.settings, 'change:lastUnlockTime', this.toggleIsUnlockedFlag);
			this.listenTo(app.settings, 'change:settingsPin', this.toggleRequirePinFlag);
			this.listenTo(app.settings, 'change:locale', this.updateLanguageToggle);
			this.listenTo(app.settings, 'change', this.toggleConfiguredFlag);
			this.toggleIsUnlockedFlag();
			this.toggleRequirePinFlag();
			this.toggleConfiguredFlag();
		},

		toggleConfiguredFlag: function() {

			$('html').toggleClass('configured', app.isConfigured());
		},

		toggleRequirePinFlag: function() {

			$('html').toggleClass('require-pin', app.requirePin());
		},

		toggleIsUnlockedFlag: function() {

			$('html').toggleClass('is-unlocked', app.isUnlocked());
		},

		initializeLanguageMenu: function() {

			this.languageMenuView = (new app.views.LanguageMenu())
				.setElement(this.$languageMenu)
				.render();
		},

		initializeMoreMenu: function() {

			this.moreMenuView = (new app.views.MoreMenu())
				.setElement(this.$moreMenu)
				.render();
		},

		renderView: function(name, options) {

			this.closeCurrentView();

			var $el = $('<div/>', {
				class: 'view'
			});

			var View = app.views[name];

			if (View.prototype.className) {
				$el.addClass(View.prototype.className);
			}

			this.$view.empty().append($el);
			var view = new View(options);
			view.setElement($el).render();

			this.currentView = view;
			this.renderViewArguments = arguments;

			if (view.className) {
				$('body').addClass('view-' + view.className);
			}
		},

		closeCurrentView: function() {

			if (this.currentView) {
				this.currentView.close();
				if (this.currentView.className) {
					$('body').removeClass('view-' + this.currentView.className);
				}
			}
		},

		reRenderView: function() {

			if (this.renderViewArguments) {
				// Re-render the view with the same arguments as it was originally rendered.
				this.renderView.apply(this, this.renderViewArguments);
			}
		},

		showLanguageMenu: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			this.$languageMenu.addClass('visible');
		},

		hideLanguageMenu: function() {

			this.$languageMenu.removeClass('visible');
		},

		showMoreMenu: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			this.$moreMenu.addClass('visible');
		},

		hideMoreMenu: function() {

			this.$moreMenu.removeClass('visible');
		},

		onDocumentInteraction: function(evt) {

			var $target = $(evt.target);

			if ($target[0] !== this.$languageMenuToggle[0]) {
				this.hideLanguageMenu();
			}

			if ($target[0] !== this.$moreMenuToggle[0]) {
				this.hideMoreMenu();
			}

			this.hideMessage();
		},

		onTouchStart: function(evt) {

			var $target = $(evt.target);
			this.interaction = {
				$target: $target,
				startTime: Date.now(),
				startPosition: this.getEventPosition(evt),
				longTimeout: setTimeout(_.bind(this.onLongTouch, this, evt), app.config.touch.long.delay),
			};
		},

		onLongTouch: function(evt) {

			// Trigger a custom event.
			var $target = $(evt.target);
			$target.trigger('longtouch', evt);
		},

		onTouchMove: function(evt) {

			if (this.interaction) {
				var $target = $(evt.target);
				if ($target[0] !== this.interaction.$target[0]) {
					this.resetInteraction();
				} else {
					var lastPosition = this.interaction.lastPosition || this.interaction.startPosition;
					var moveX = Math.abs(this.interaction.startPosition.x - lastPosition.x);
					var moveY = Math.abs(this.interaction.startPosition.y - lastPosition.y);
					var movement = Math.max(
						moveX / $(window).width(),
						moveY / $(window).height()
					) * 100;
					this.interaction.lastPosition = this.getEventPosition(evt);
					if (movement > app.config.touch.quick.maxMovement) {
						this.resetInteraction();
					}
				}
			}
		},

		onTouchEnd: function(evt) {

			if (this.interaction) {
				clearTimeout(this.interaction.longTimeout);
				var $target = $(evt.target);
				if ($target[0] === this.interaction.$target[0]) {
					var diffTime = Date.now() - this.interaction.startTime;
					if (diffTime < app.config.touch.quick.maxTime) {
						evt.preventDefault();
						evt.stopPropagation();
						this.onQuickTouch(evt);
					}
				}
				this.resetInteraction();
			}
		},

		onQuickTouch: function(evt) {

			var $target = $(evt.target);
			$target.addClass('quicktouch');
			_.delay(function() {
				$target.removeClass('quicktouch');
			}, app.config.touch.quick.uiFeedbackDuration);
			// Trigger a custom event.
			$target.trigger('quicktouch', evt);
		},

		onTouchCancel: function(evt) {

			this.resetInteraction();
		},

		onMouseDown: function(evt) {

			// Left-mouse button only.
			if (evt && evt.which === 1) {
				this.onTouchStart(evt);
			}
		},

		onMouseMove: function(evt) {

			this.onTouchMove(evt);
		},

		onMouseUp: function(evt) {

			// Left-mouse button only.
			if (evt && evt.which === 1) {
				this.onTouchEnd(evt);
			}
		},

		resetInteraction: function() {

			if (this.interaction) {
				clearTimeout(this.interaction.longTimeout);
			}
			this.interaction = null;
		},

		getEventPosition: function(evt) {

			return {
				x: evt.originalEvent.touches && evt.originalEvent.touches[0].pageX || evt.clientX,
				y: evt.originalEvent.touches && evt.originalEvent.touches[0].pageY || evt.clientY,
			};
		},

		showMessage: function(message) {

			// Defer here in case this method was called as a result of an event that needs to further propogate.
			// The hideMessage method is called because of the document event, which could happen after.
			_.defer(_.bind(function() {

				if (message.status === 0) {
					this.$messageContent.text(app.i18n.t('main.message.status.0'));
				} else {
					this.$messageContent.text(message.message || message);
				}

				this.$message.addClass('visible');

			}, this));
		},

		hideMessage: function() {

			this.$message.removeClass('visible');
		},

		updateLanguageToggle: function() {

			var locale = app.settings.get('locale') || app.config.defaultLocale;
			_.each(_.keys(app.lang), function(key) {
				this.$languageMenuToggle.removeClass(key);
			}, this);
			this.$languageMenuToggle.addClass(locale);
		},

		changeLanguage: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			var $target = $(evt.target);
			var newLocale = $target.attr('data-locale');
			app.busy();
			_.delay(function() {
				app.settings.set('locale', newLocale);
				_.delay(function() {
					app.busy(false);
				}, 100);
			}, 500/* let the close animation finish */);
		},

		onClick: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}
		},

		onQuickTouchAnchor: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			var $target = $(evt.target);
			var href = $target.attr('href');
			if (href) {
				if (href.substr(0, 1) === '#') {
					// Internal navigation.
					app.router.navigate(href, { trigger: true });
				} else if (app.isCordova()) {
					cordova.InAppBrowser.open(href);
				} else {
					window.open(href, '_blank');
				}
			}
		},

		render: function() {
			// Do not render this view.
		},

		close: function() {
			// Do not close this view.
		},

		onClose: function() {
			$(document).off('click quicktouch', this.onDocumentInteraction);
		},

	});

})();
