var app = app || {};

app.views = app.views || {};

app.views.Main = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		el: '#app',
		template: '#template-main',

		events: {
			'click #main-menu-toggle': 'toggleMainMenu',
			'click #language-menu-toggle': 'toggleLanguageMenu',
			'click #language-menu .menu-item': 'changeLanguage',
			'change .display-currency-change': 'changeDisplayCurrency'
		},

		currentView: null,

		initialize: function() {

			_.bindAll(this, 'onDocumentClick');
			$(document).on('click', this.onDocumentClick);
			app.settings.on('change:locale', this.render);
		},

		renderView: function(name, options) {

			var view = new app.views[name](options || {});

			view.$el.addClass('view');

			this.$viewContent.html(view.render().el);

			if (this.currentView) {

				this.currentView.close();

				if (this.currentView.className) {
					$('body').removeClass('view-' + this.currentView.className);
				}
			}

			this.currentView = view;
			this.renderViewArguments = arguments;

			if (view.className) {
				$('body').addClass('view-' + view.className);
			}
		},

		reRenderView: function() {

			if (this.renderViewArguments) {
				// Re-render the view with the same arguments as it was originally rendered.
				this.renderView.apply(this, this.renderViewArguments);
			}
		},

		onRender: function() {

			this.$mainMenu = this.$('#main-menu');
			this.$mainMenuToggle = this.$('#main-menu-toggle');
			this.$languageMenu = this.$('#language-menu');
			this.$languageMenuToggle = this.$('#language-menu-toggle');
			this.$viewContent = this.$('#view-content');
			this.$message = this.$('#message');
			this.$messageContent = this.$('#message-content');
			this.updateLanguageToggle();
			this.reRenderView();
			return this;
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

		changeDisplayCurrency: function(evt) {

			app.settings.set('displayCurrency', $(evt.target).val()).save();
		},

		onClose: function() {

			$(document).off('click', this.onDocumentClick);
			app.settings.off('change:locale', this.render);
		},

		serializeData: function() {

			var data = {};
			data.languages = _.map(_.keys(app.lang), function(key) {
				return {
					key: key,
					label: app.i18n.t('language.' + key)
				};
			});
			return data;
		}

	});

})();
