var app = app || {};

app.views = app.views || {};

app.views.GettingStarted = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'getting-started',
		template: '#template-getting-started',
		events: {
			'click .button.back': 'back',
			'click .button.next': 'next',
			'click .skip': 'skip',
			'click label[for^="configurableCryptoCurrencies-"]': 'onClickCryptoCurrencyToggle',
		},

		initialize: function() {

			_.bindAll(this, 'setActiveMenuItem', 'toggleCryptoCurrency', 'goToSubPage');
			this.toggleCryptoCurrency = _.debounce(this.toggleCryptoCurrency, 20);
			this.goToSubPage = _.debounce(this.goToSubPage, 20);

			if (!this.options.page) {
				var defaultSubPage = this.getDefaultSubPage();
				this.options.page = defaultSubPage && defaultSubPage.key || null;
			}
		},

		subPages: function() {

			var subPages = [];

			subPages.push({
				key: 'welcome',
				label: app.i18n.t('getting-started.page.welcome.title'),
				ContentView: app.views.GettingStartedWelcome,
				visible: true,
			});

			subPages.push({
				key: 'choose-payment-methods',
				label: app.i18n.t('getting-started.page.choose-payment-methods.title'),
				ContentView: app.views.GettingStartedChoosePaymentMethods,
				visible: true,
			});

			var configurableCryptoCurrencies = app.settings.get('configurableCryptoCurrencies');

			_.each(app.paymentMethods, function(paymentMethod, key) {
				subPages.push({
					key: 'payment-method-settings-' + key,
					label: _.result(paymentMethod, 'label'),
					ContentView: app.views.GettingStartedPaymentMethodSettings,
					ContentViewOptions: { key: key },
					visible: _.contains(configurableCryptoCurrencies, key),
				});
				subPages.push({
					key: 'payment-method-verify-' + key,
					label: _.result(paymentMethod, 'label'),
					ContentView: app.views.GettingStartedPaymentMethodVerify,
					ContentViewOptions: { key: key },
					visible: _.contains(configurableCryptoCurrencies, key),
				});
			}, this);

			subPages.push({
				key: 'general-settings',
				label: app.i18n.t('getting-started.page.general-settings.title'),
				ContentView: app.views.GettingStartedGeneralSettings,
				visible: true,
			});

			subPages.push({
				key: 'done',
				label: app.i18n.t('getting-started.page.done.title'),
				ContentView: app.views.GettingStartedDone,
				visible: true,
			});

			return subPages;
		},

		getDefaultSubPage: function() {

			var subPages = _.result(this, 'subPages');
			var visibleSubPages = _.where(subPages, {visible: true})
			return visibleSubPages && visibleSubPages[0] || null;
		},

		serializeData: function() {

			var data = {};
			var subPages = _.result(this, 'subPages');

			data.menuItems = _.map(subPages, function(subPage) {
				return _.pick(subPage, 'key', 'label', 'visible');
			});

			return data;
		},

		onRender: function() {

			this.$menuItems = this.$('.getting-started-step');
			this.setVisibilityOfMenuItems();
			this.initializeSlider();
			this.updateCryptoCurrencySettingsVisibility();

			if (this.options.page) {
				this.slider.switchToItem(this.options.page);
				this.setActiveMenuItem(this.options.page);
			}
		},

		setVisibilityOfMenuItems: function() {

			var subPages = _.result(this, 'subPages');
			_.each(subPages, function(subPage) {
				this.$menuItems.filter('.' + subPage.key).toggleClass('visible', subPage.visible);
			}, this);
		},

		back: function(evt) {

			var previousItem = this.slider.getPreviousVisibleItem();
			if (!previousItem) return;
			this.goToSubPage(previousItem.key);
		},

		next: function(evt) {

			var nextItem = this.slider.getNextVisibleItem();
			if (!nextItem) return;
			this.goToSubPage(nextItem.key);
		},

		skip: function(evt) {

			app.markGettingStartedAsComplete();
			app.router.navigate('admin', { trigger: true });
		},

		goToSubPage: function(key) {

			this.slider.switchToItem(key);
			this.setActiveMenuItem(key);
		},

		initializeSlider: function() {

			var subPages = _.result(this, 'subPages');
			var items = _.map(subPages, function(subPage) {
				return {
					key: subPage.key,
					contentView: new subPage.ContentView(subPage.ContentViewOptions || {}),
					visible: subPage.visible,
				};
			});

			this.slider = new app.views.Slider({
				el: this.$('.slider'),
				items: items,
				canSwipe: false,
			});

			this.listenTo(this.slider, 'change:active', this.setActiveMenuItem);
		},

		setActiveMenuItem: function(key) {

			this.options.page = key;
			this.$menuItems.removeClass('active');
			this.$menuItems.filter('[data-key="' + key + '"]').addClass('active');
			app.router.navigate('#getting-started/' + encodeURIComponent(key), { trigger: false });
		},

		onClickCryptoCurrencyToggle: function(evt) {

			var $target = $(evt.target);
			var key = $target.attr('data-key');
			this.toggleCryptoCurrency(key);
		},

		toggleCryptoCurrency: function(key) {

			var $input = this.$(':input[value="' + key + '"]');
			var isChecked = $input.is(':checked');
			this.setCryptoCurrencySettingsVisibility(key, isChecked);
		},

		setCryptoCurrencySettingsVisibility: function(key, visible) {

			visible = visible === true;
			this.$menuItems.filter('[data-key="' + key + '"]').toggleClass('visible', visible);
			if (visible) {
				this.slider.showItems(key);
			} else {
				this.slider.hideItems(key);
			}
		},

		updateCryptoCurrencySettingsVisibility: function() {

			var configurableCryptoCurrencies = app.settings.get('configurableCryptoCurrencies') || [];
			_.each(_.keys(app.paymentMethods), function(key) {
				var visible = _.contains(configurableCryptoCurrencies, key);
				this.setCryptoCurrencySettingsVisibility(key, visible);
			}, this);
		},

		onClose: function() {

			if (this.slider) {
				this.slider.close();
			}
		},

		onBackButton: function() {

			var page = this.options.page;
			var defaultSubPage = this.getDefaultSubPage();
			var isConfigured = app.isConfigured();

			if (defaultSubPage && page === defaultSubPage.key && !isConfigured) {
				app.exit();
			} else {
				app.router.navigate('getting-started', { trigger: true });
			}
		}
	});

})();
