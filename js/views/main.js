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
			'mouseleave': 'onMouseLeave',
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
				'onDocumentTouch',
				'toggleIsUnlockedFlag',
				'toggleRequirePinFlag',
				'toggleConfiguredFlag',
				'onBeforeUnload'
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
			$(document).on('quicktouch', this.onDocumentTouch);
			$(window).on('beforeunload', this.onBeforeUnload);
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

			app.log('mainView.renderView', name);
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

		onDocumentTouch: function(evt) {

			app.log('onDocumentTouch');
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

			app.log('onTouchStart');
			var $target = $(evt.target);
			this.interaction = {
				$target: $target,
				startTime: Date.now(),
				startPosition: this.getEventPosition(evt),
				longTimeout: setTimeout(_.bind(this.onLongTouch, this, evt), app.config.touch.long.delay),
			};
		},

		onLongTouch: function(evt) {

			app.log('onLongTouch');
			// Trigger a custom event.
			var $target = $(evt.target);
			$target.trigger('longtouch', evt);
		},

		onTouchMove: function(evt) {

			if (this.interaction) {
				var $target = $(evt.target);
				if ($target[0] !== this.interaction.$target[0]) {
					this.interaction.quick = false;
				}
				var previous = {
					position: this.interaction.lastPosition || this.interaction.startPosition,
					time: this.interaction.lastTime || this.interaction.startTime,
				};
				this.interaction.lastPosition = this.getEventPosition(evt);
				this.interaction.lastTime = Date.now();
				var canSwipe = $target.hasClass('can-swipe') || $target.parents('.can-swipe').length > 0;
				if (canSwipe) {
					var moveX = this.interaction.startPosition.x - this.interaction.lastPosition.x;
					var moveY = this.interaction.startPosition.y - this.interaction.lastPosition.y;
					var absoluteMoveX = Math.abs(moveX);
					var absoluteMoveY = Math.abs(moveY);
					var tolerance = (4 / 100) * $(window).width();
					// If movement is more vertical than horizontal, the user is probably trying to scroll.
					// Allow for some tolerance.
					if (absoluteMoveY > (absoluteMoveX + tolerance)) {
						// Scroll.
						this.resetInteraction();
					} else {
						// Not scroll.
						/*
							!! IMPORTANT !!
							Calling preventDefault() prevents the premature touchcancel event in Android 4.4.x

							See:
							https://stackoverflow.com/questions/10367854/html5-android-touchcancel
						*/
						evt.preventDefault();
						this.interaction.velocity = this.calculateVelocity(
							this.interaction.lastPosition.x,
							previous.position.x,
							previous.time
						);
					}
				}
			}
		},

		onTouchEnd: function(evt) {

			app.log('onTouchEnd');
			if (this.interaction) {
				clearTimeout(this.interaction.longTimeout);
				var $target = $(evt.target);
				var elapsedTime = Date.now() - this.interaction.startTime;
				var lastPosition = this.interaction.lastPosition || this.interaction.startPosition;
				var moveX = this.interaction.startPosition.x - lastPosition.x;
				var moveY = this.interaction.startPosition.y - lastPosition.y;
				var absoluteMoveX = Math.abs(moveX);
				var absoluteMoveY = Math.abs(moveY);
				var movement = Math.max(
					absoluteMoveX / $(window).width(),
					absoluteMoveY / $(window).height()
				) * 100;
				var isQuickTouch = (
					this.interaction.quick !== false &&
					$target[0] === this.interaction.$target[0] &&
					elapsedTime <= app.config.touch.quick.maxTime &&
					movement <= app.config.touch.quick.maxMovement
				);
				if (isQuickTouch) {
					evt.preventDefault();
					evt.stopPropagation();
					this.onQuickTouch(evt);
				}
				var velocity = this.interaction.velocity;
				if (velocity) {
					var speed = Math.abs(velocity);
					var minSpeed = $(window).width() * (app.config.touch.swipe.minSpeed / 100);
					var minMovementX = $(window).width() * (app.config.touch.swipe.minMovementX / 100);
					var isSwipe = absoluteMoveX >= minMovementX && speed >= minSpeed;
					if (isSwipe) {
						this.onSwipe(evt, velocity);
					}
				}
				this.resetInteraction();
			}
		},

		onQuickTouch: function(evt) {

			app.log('onQuickTouch');
			var $target = $(evt.target);
			$target.addClass('quicktouch');
			_.delay(function() {
				$target.removeClass('quicktouch');
			}, app.config.touch.quick.uiFeedbackDuration);
			// Trigger a custom event.
			$target.trigger('quicktouch', evt);
		},

		onSwipe: function(evt, velocity) {

			app.log('onSwipe');
			// Trigger a custom event.
			$(evt.target).trigger('swipe', [velocity]);
		},

		onTouchCancel: function(evt) {

			app.log('onTouchCancel');
			this.resetInteraction();
		},

		onMouseDown: function(evt) {

			app.log('onMouseDown');
			// Left-mouse button only.
			if (evt && evt.which === 1) {
				this.onTouchStart(evt);
			}
		},

		onMouseMove: function(evt) {

			app.log('onMouseMove');
			this.onTouchMove(evt);
		},

		onMouseUp: function(evt) {

			app.log('onMouseUp');
			// Left-mouse button only.
			if (evt && evt.which === 1) {
				this.onTouchEnd(evt);
			}
		},

		onMouseLeave: function(evt) {

			app.log('onMouseLeave');
			this.onTouchEnd(evt);
		},

		resetInteraction: function() {

			if (this.interaction) {
				clearTimeout(this.interaction.longTimeout);
			}
			this.interaction = null;
		},

		calculateVelocity: function(endPosX, startPosX, startTime) {

			return (endPosX - startPosX) / (Date.now() - startTime);
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

			app.log('onClick');
			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}
		},

		onQuickTouchAnchor: function(evt) {

			app.log('onQuickTouchAnchor');
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

		onBeforeUnload: function() {

			app.cleanUpPendingPaymentRequest();
		},

		render: function() {
			// Do not render this view.
		},

		close: function() {
			// Do not close this view.
		},

	});

})();
