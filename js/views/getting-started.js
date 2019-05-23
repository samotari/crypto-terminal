var app = app || {};

app.views = app.views || {};

app.views.GettingStarted = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'getting-started',
		template: '#template-getting-started',
		events: {
			'click .button.back': 'back',
			'click .button.continue': 'continue',
			'click label[for^="configurableCryptoCurrencies-"]': 'onClickCryptoCurrencyToggle',
			'change :input': 'onChangeInput',
		},

		initialize: function() {

			_.bindAll(this, 'setActiveMenuItem', 'toggleCryptoCurrency', 'goToSubPage', 'toggleCurrentItemCompletedFlag');
			this.toggleCryptoCurrency = _.debounce(this.toggleCryptoCurrency, 20);
			this.goToSubPage = _.debounce(this.goToSubPage, 20);

			if (!this.options.page) {
				var defaultSubPage = this.getDefaultSubPage();
				this.options.page = defaultSubPage && defaultSubPage.key || null;
			}

			this.listenTo(app.settings, 'change', this.toggleCurrentItemCompletedFlag);
		},

		subPages: function() {

			var subPages = [];

			subPages.push({
				key: 'welcome',
				label: app.i18n.t('getting-started.welcome.title'),
				ContentView: app.views.GettingStartedWelcome,
				visible: true,
			});

			subPages.push({
				key: 'choose-payment-methods',
				label: app.i18n.t('getting-started.choose-payment-methods.title'),
				ContentView: app.views.GettingStartedChoosePaymentMethods,
				visible: true,
			});

			var configurableCryptoCurrencies = app.settings.get('configurableCryptoCurrencies');

			_.each(app.paymentMethods, function(paymentMethod, key) {

				var enabled = _.result(paymentMethod, 'enabled') === true;
				if (!enabled) return;

				subPages.push({
					key: 'payment-method-settings-' + key,
					label: _.result(paymentMethod, 'label'),
					ContentView: app.views.GettingStartedPaymentMethodSettings,
					ContentViewOptions: { key: key },
					visible: _.contains(configurableCryptoCurrencies, key),
				});
			});

			subPages.push({
				key: 'general-settings',
				label: app.i18n.t('getting-started.general-settings.title'),
				ContentView: app.views.GettingStartedGeneralSettings,
				visible: true,
			});

			subPages.push({
				key: 'done',
				label: app.i18n.t('getting-started.done.title'),
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

		onRender: function() {

			this.initializeSlider();
			this.updateCryptoCurrencySettingsVisibility();

			var page = app.cache.get('getting-started-last-step') || this.options.page;
			if (page) {
				this.goToSubPage(page);
			}
		},

		onResize: function() {

			if (this.options.page) {
				this.goToSubPage(this.options.page);
			}
		},

		back: function() {

			var previousItem = this.slider.getPreviousVisibleItem();
			if (!previousItem) return;
			this.goToSubPage(previousItem.key);
		},

		continue: function() {

			var currentItem = this.slider.getCurrentItem();
			if (currentItem.contentView && _.isFunction(currentItem.contentView.isComplete)) {
				// If the current step is incomplete, don't go to the next step.
				if (!currentItem.contentView.isComplete()) return;
			}

			var nextItem = this.slider.getNextVisibleItem();
			if (nextItem) {
				this.goToSubPage(nextItem.key);
			}
		},

		goToSubPage: function(key) {

			if (!this.slider.isVisible(key)) {
				var defaultSubPage = this.getDefaultSubPage();
				this.goToSubPage(defaultSubPage.key);
			}

			this.slider.switchToItem(key);
			var currentItem = this.slider.getCurrentItem();
			if (currentItem) {
				var contentView = currentItem.contentView;
				var title = contentView && _.result(contentView, 'title');
				app.mainView.setHeaderText(title || '');
			}
			this.setActiveMenuItem(key);
			this.toggleCurrentItemCompletedFlag();
			app.cache.set('getting-started-last-step', key);
		},

		initializeSlider: function() {

			var subPages = _.result(this, 'subPages');
			var items = _.map(subPages, function(subPage) {
				var contentViewOptions = _.result(subPage, 'ContentViewOptions');
				return {
					key: subPage.key,
					contentView: new subPage.ContentView(contentViewOptions),
					visible: subPage.visible,
				};
			});

			this.slider = new app.views.Slider({
				el: this.$('.slider'),
				items: items,
				canSwipe: false,
			});

			this.listenTo(this.slider, 'change:active', this.setActiveMenuItem);

			_.each(this.slider.items, function(item) {
				this.listenTo(item.contentView, 'completed', this.toggleCurrentItemCompletedFlag);
			}, this);
		},

		setActiveMenuItem: function(key) {

			this.options.page = key;
			$('.view.getting-started').attr('data-subpage', key);
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
			this.setCryptoCurrencyVisibility(key, isChecked);
		},

		setCryptoCurrencyVisibility: function(key, visible) {

			visible = visible === true;
			var itemKeys = [
				'payment-method-settings-' + key,
			];
			if (visible) {
				this.slider.showItems(itemKeys);
			} else {
				this.slider.hideItems(itemKeys);
			}
		},

		updateCryptoCurrencySettingsVisibility: function() {

			var configurableCryptoCurrencies = app.settings.get('configurableCryptoCurrencies') || [];
			_.each(_.keys(app.paymentMethods), function(key) {
				var visible = _.contains(configurableCryptoCurrencies, key);
				this.setCryptoCurrencyVisibility(key, visible);
			}, this);
		},

		onChangeInput: function() {

			this.toggleCurrentItemCompletedFlag();
		},

		toggleCurrentItemCompletedFlag: function() {

			var currentItem = this.slider.getCurrentItem();
			if (currentItem) {
				var isComplete = !_.isFunction(currentItem.contentView.isComplete) || currentItem.contentView.isComplete();
				currentItem.contentView.$('.button.continue').toggleClass('disabled', !isComplete);
			}
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
				this.back();
			}
		},

	});

})();
