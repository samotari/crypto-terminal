var app = app || {};

app.views = app.views || {};

app.views.Main = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		el: 'body',

		events: {
			'click #language-menu-toggle': 'toggleLanguageMenu',
			'click #language-menu .menu-item': 'changeLanguage',
		},

		currentView: null,

		initialize: function() {

			_.bindAll(this,
				'onDocumentClick',
				'toggleIsUnlockedFlag',
				'toggleRequirePinFlag',
				'toggleConfiguredFlag'
			);
			this.$languageMenu = this.$('#language-menu');
			this.$languageMenuToggle = this.$('#language-menu-toggle');
			this.$view = this.$('#view');
			this.$message = this.$('#message');
			this.$messageContent = this.$('#message-content');
			this.initializeLanguageMenu();
			this.updateLanguageToggle();
			this.reRenderView();
			$(document).on('click', this.onDocumentClick);
			this.listenTo(app.settings, 'change:lastUnlockTime', this.toggleIsUnlockedFlag);
			this.listenTo(app.settings, 'change:settingsPin', this.toggleRequirePinFlag);
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

		toggleLanguageMenu: function() {

			this.$languageMenu.toggleClass('visible');
		},

		hideLanguageMenu: function() {

			this.$languageMenu.removeClass('visible');
		},

		onDocumentClick: function(evt) {

			var $target = $(evt.target);

			if ($target[0] !== this.$languageMenuToggle[0]) {
				this.hideLanguageMenu();
			}

			this.hideMessage();
		},

		showMessage: function(message) {

			// Defer here in case this method was called as a result of an event that needs to further propogate.
			// The hideMessage method is called because of the document click event, which could happen after.
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
