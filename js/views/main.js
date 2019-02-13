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
			'click .header-button.language': 'showLanguageMenu',
			'click .header-button.more': 'showMoreMenu',
			'click #language-menu .menu-item': 'changeLanguage',
			'click a': 'onClickAnchor',
		},

		views: {},
		currentView: null,
		$interactTarget: null,
		interaction: null,
		isTouchDevice: false,

		initialize: function() {

			_.bindAll(this,
				'onDocumentClick',
				'setTouchDeviceFlag',
				'toggleIsUnlockedFlag',
				'toggleRequirePinFlag',
				'toggleConfiguredFlag',
				'setThemeFlag',
				'onBeforeUnload'
			);
			this.$menuCover = this.$('#menu-cover');
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
			$(document).on('click', this.onDocumentClick);
			$(document).one('touchstart', this.setTouchDeviceFlag);
			$(window).on('beforeunload', this.onBeforeUnload);
			this.listenTo(app.settings, 'change:lastUnlockTime', this.toggleIsUnlockedFlag);
			this.listenTo(app.settings, 'change:settingsPin', this.toggleRequirePinFlag);
			this.listenTo(app.settings, 'change:locale', this.updateLanguageToggle);
			this.listenTo(app.settings, 'change:theme', this.setThemeFlag);
			this.listenTo(app.settings, 'change', this.toggleConfiguredFlag);
			this.toggleIsUnlockedFlag();
			this.toggleRequirePinFlag();
			this.toggleConfiguredFlag();
			this.setThemeFlag();
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

		setThemeFlag: function(theme) {

			theme = theme || app.settings.get('theme');
			var settingConfig = _.findWhere(app.config.settings, { name: 'theme' });
			if (settingConfig) {
				var options = _.result(settingConfig, 'options');
				_.each(options, function(option) {
					$('html').removeClass('theme-' + option.key);
				});
			}
			$('html').addClass('theme-' + theme);
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

			var View = app.views[name];
			var view;

			this.removeCurrentViewClassName();

			if (this.views[name] && this.views[name].view.doNotClose === true) {
				view = this.views[name].view;
				this.views[name].options = options;
				this.$view.empty().append(view.$el);
				view.options = options;
				view.setElement(view.$el);
			} else {

				if (this.currentView && this.currentView.view && this.currentView.view.doNotClose !== true) {
					this.currentView.view.close();
				}

				var $el = $('<div/>', {
					class: 'view'
				});
				if (View.prototype.className) {
					$el.addClass(View.prototype.className);
				}
				view = new View(options);
				this.$view.empty().append($el);
				view.setElement($el).render();
				this.views[name] = {
					name: name,
					options: options,
					view: view,
				};
			}

			this.currentView = {
				name: name,
				options: options,
				view: view,
			};

			if (view.className) {
				$('body').addClass('view-' + view.className);
			}
		},

		removeCurrentViewClassName: function() {

			if (this.currentView) {
				var className = this.currentView.view.className;
				if (className) {
					$('body').removeClass('view-' + className);
				}
			}
		},

		reRenderView: function() {

			if (this.currentView) {
				// Re-render the view with the same arguments as it was originally rendered.
				var name = this.currentView.name;
				var options = this.currentView.options;
				this.renderView(name, options);
			}
		},

		showMenuCover: function() {

			this.$menuCover.addClass('visible');
		},

		hideMenuCover: function() {

			this.$menuCover.removeClass('visible');
		},

		showLanguageMenu: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			this.showMenuCover();
			this.$languageMenu.addClass('visible');
		},

		hideLanguageMenu: function() {

			this.$languageMenu.removeClass('visible');
		},

		showMoreMenu: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			this.showMenuCover();
			this.$moreMenu.addClass('visible');
		},

		hideMoreMenu: function() {

			this.$moreMenu.removeClass('visible');
		},

		onDocumentClick: function(evt) {

			app.log('onDocumentClick');
			var $target = $(evt.target);
			var isLanguageMenu = $target[0] === this.$languageMenuToggle[0];
			var isMoreMenu = $target[0] === this.$moreMenuToggle[0];

			if (!isLanguageMenu) {
				this.hideLanguageMenu();
			}

			if (!isMoreMenu) {
				this.hideMoreMenu();
			}

			if (!isLanguageMenu && !isMoreMenu) {
				this.hideMenuCover();
			}

			if (!$target.is(':input')) {
				this.$(':input:focus').blur();
			}

			this.hideMessage();
		},

		setTouchDeviceFlag: function(evt) {

			this.isTouchDevice = true;
		},

		onTouchStart: function(evt) {

			app.log('onTouchStart');
			var $target = $(evt.target);
			this.interaction = {
				$target: $target,
				startTime: Date.now(),
				startPosition: this.getEventPosition(evt),
				longTouchStartTimeout: setTimeout(_.bind(this.onLongTouchStart, this, evt), app.config.touch.long.delay),
			};
			$target.addClass('touchstart');
		},

		onLongTouchStart: function(evt) {

			app.log('onLongTouchStart');
			// Trigger a custom event.
			$(evt.target).trigger('longtouchstart').addClass('longtouch');
		},

		onTouchMove: function(evt) {

			if (this.interaction) {
				var $target = $(evt.target);
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
					var tolerance = (app.config.touch.swipe.tolerance / 100) * $(window).width();
					// If movement is more vertical than horizontal, the user is probably trying to scroll.
					// Allow for some tolerance.
					if (absoluteMoveY > (absoluteMoveX - tolerance)) {
						// Scroll.
						this.resetInteraction(evt);
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
				var $target = $(evt.target);
				clearTimeout(this.interaction.longTouchStartTimeout);
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
					this.isTouchDevice === true &&
					this.interaction.quick !== false &&
					$target[0] === this.interaction.$target[0] &&
					elapsedTime <= app.config.touch.quick.maxTime &&
					movement <= app.config.touch.quick.maxMovement
				);
				if (isQuickTouch) {
					switch ($target[0].tagName) {
						case 'SELECT':
						case 'INPUT':
							// These need to continue with their default behavior.
							break;
						default:
							// For most HTML elements, we want to prevent the default behavior.
							// This is necessary to prevent double firing of events.
							evt.preventDefault();
							break;
					}
					$target.trigger('click');
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
			}
			this.resetInteraction(evt);
		},

		onSwipe: function(evt, velocity) {

			app.log('onSwipe');
			// Trigger a custom event.
			$(evt.target).trigger('swipe', [velocity]);
		},

		onTouchCancel: function(evt) {

			app.log('onTouchCancel');
			this.resetInteraction(evt);
		},

		onMouseDown: function(evt) {

			app.log('onMouseDown');
			// Left-mouse button only.
			if (!this.isTouchDevice && evt && evt.which === 1) {
				this.onTouchStart(evt);
			}
		},

		onMouseMove: function(evt) {

			app.log('onMouseMove');
			if (!this.isTouchDevice) {
				this.onTouchMove(evt);
			}
		},

		onMouseUp: function(evt) {

			app.log('onMouseUp');
			// Left-mouse button only.
			if (!this.isTouchDevice && evt && evt.which === 1) {
				this.onTouchEnd(evt);
			}
		},

		onMouseLeave: function(evt) {

			app.log('onMouseLeave');
			if (!this.isTouchDevice) {
				this.onTouchEnd(evt);
			}
		},

		resetInteraction: function(evt) {

			$('.touchstart').removeClass('touchstart');
			$('.longtouch').removeClass('longtouch').trigger('longtouchend');
			if (this.interaction) {
				clearTimeout(this.interaction.longTouchStartTimeout);
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

				var messageText;

				if (_.isString(message)) {
					messageText = message;
				} else if (message.status === 0) {
					messageText = app.i18n.t('main.message.status.0');
				} else if (message.message && _.isString(message.message)) {
					messageText = message.message;
				} else if (message.error && _.isString(message.error)) {
					messageText = message.error;
				}

				if (messageText) {
					this.$messageContent.text(messageText);
					this.$message.addClass('visible');
				}

			}, this));
		},

		hideMessage: function() {

			this.$message.removeClass('visible');
		},

		updateLanguageToggle: function() {

			var locale = app.i18n.getCurrentLocale() || app.i18n.getDefaultLocale();
			this.$languageMenuToggle.text(locale);
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

		setHeaderText: function(text) {

			this.$('#header .header-text').text(text);
		},

		onClickAnchor: function(evt) {

			app.log('onClickAnchor');
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
					/*
						See:
						https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-inappbrowser/
					*/
					cordova.InAppBrowser.open(href, '_system');
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
