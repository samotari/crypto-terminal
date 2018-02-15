var app = app || {};

app.views = app.views || {};

app.views.Main = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		el: 'body',

		events: {
			'click #main-menu-toggle': 'toggleMainMenu',
			'click #language-menu-toggle': 'toggleLanguageMenu',
			'click #language-menu .menu-item': 'changeLanguage',
		},

		currentView: null,

		initialize: function() {

			_.bindAll(this, 'onDocumentClick');
			$(document).on('click', this.onDocumentClick);
			this.$mainMenu = this.$('#main-menu');
			this.$mainMenuToggle = this.$('#main-menu-toggle');
			this.$languageMenu = this.$('#language-menu');
			this.$languageMenuToggle = this.$('#language-menu-toggle');
			this.$view = this.$('#view');
			this.$message = this.$('#message');
			this.$messageContent = this.$('#message-content');
			this.initializeMainMenu();
			this.initializeLanguageMenu();
			this.updateLanguageToggle();
			this.reRenderView();
		},

		initializeMainMenu: function() {

			this.mainMenuView = (new app.views.MainMenu())
				.setElement(this.$mainMenu)
				.render();
		},

		initializeLanguageMenu: function() {

			this.languageMenuView = (new app.views.LanguageMenu())
				.setElement(this.$languageMenu)
				.render();
		},

		renderView: function(name, options) {

			this.closeCurrentView();

			var $el = $('<div/>', {
				class: 'view'
			});

			this.$view.empty().append($el);
			var view = new app.views[name](options);
			view.setElement($el).render();

			if (view.className) {
				$el.addClass(view.className);
			}

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

		toggleMainMenu: function() {

			this.$mainMenu.toggleClass('visible');
		},

		hideMainMenu: function() {

			this.$mainMenu.removeClass('visible');
		},

		toggleLanguageMenu: function() {

			this.$languageMenu.toggleClass('visible');
		},

		hideLanguageMenu: function() {

			this.$languageMenu.removeClass('visible');
		},

		onDocumentClick: function(evt) {

			var $target = $(evt.target);

			if ($target[0] !== this.$mainMenuToggle[0]) {
				this.hideMainMenu();
			}

			if ($target[0] !== this.$languageMenuToggle[0]) {
				this.hideLanguageMenu();
			}

			this.hideMessage();
		},

		showMessage: function(message) {

			if (message.status === 0) {
				this.$messageContent.text(app.i18n.t('main.message.status.0'));
			} else {
				this.$messageContent.text(message.message || message);
			}

			this.$message.addClass('visible');
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

			// Prevent navigation event when clicking a link:
			evt.preventDefault();

			var $target = $(evt.target);
			var newLocale = $target.attr('data-locale');
			app.settings.set('locale', newLocale).save();
		},

		render: function() {
			// Do not render this view.
		},

		close: function() {
			// Do not close this view.
		},

		busy: function() {
			$('#overlay').show();
		},

		notBusy: function() {
			$('#overlay').hide();
		}

	});

})();
