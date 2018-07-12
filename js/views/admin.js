var app = app || {};

app.views = app.views || {};

app.views.Admin = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'admin',
		template: '#template-admin',

		events: {
			'click label[for^="settings-configurableCryptoCurrencies-"]': 'onClickCryptoCurrencyToggle',
			'click .secondary-menu-item': 'onClickNavMenuItem',
		},

		subPages: function() {

			var subPages = [];

			// General settings.
			subPages.push({
				key: 'general-settings',
				label: app.i18n.t('admin.general-settings.label'),
				ContentView: app.views.AdminGeneralSettings,
				visible: true,
			});

			var configurableCryptoCurrencies = app.settings.get('configurableCryptoCurrencies');

			// Payment method settings.
			_.each(app.paymentMethods, function(paymentMethod, key) {
				subPages.push({
					key: key,
					label: _.result(paymentMethod, 'label'),
					ContentView: app.views.AdminPaymentMethodSettings,
					ContentViewOptions: { key: key },
					visible: _.contains(configurableCryptoCurrencies, key),
				});
			}, this);

			// Payment history.
			subPages.push({
				key: 'payment-history',
				label: app.i18n.t('admin.payment-history.label'),
				ContentView: app.views.PaymentHistory,
				visible: true,
			});

			return subPages;
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

			this.$menuItems = this.$('.secondary-menu-item');
			this.setVisibilityOfMenuItems();
			this.initializeSlider();
			this.updateCryptoCurrencySettingsVisibility();

			if (this.options.page) {
				this.slider.switchToItem(this.options.page);
				this.setActiveMenuItem(this.options.page);
			}

			this.updateSecondaryMenuWidth();
		},

		setVisibilityOfMenuItems: function() {

			var subPages = _.result(this, 'subPages');
			_.each(subPages, function(subPage) {
				this.$menuItems.filter('.' + subPage.key).toggleClass('visible', subPage.visible);
			}, this);
		},

		onClickNavMenuItem: function(evt) {

			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}

			var $target = $(evt.target);
			var key = $target.attr('data-key');
			if (key) {
				if (evt && evt.stopPropagation) {
					evt.stopPropagation();
				}
				this.goToSubPage(key);
			}
		},

		goToSubPage: function(key) {

			this.slider.switchToItem(key);
			this.setActiveMenuItem(key);
		},

		onResize: function() {

			this.updateSecondaryMenuWidth();
		},

		updateSecondaryMenuWidth: function() {

			_.defer(_.bind(function() {
				// Start with some extra width to ensure no wrapping.
				var newWidth = 60;
				this.$('.secondary-menu-item').each(function() {
					if ($(this).is(':visible')) {
						newWidth += $(this).outerWidth();
					}
				});
				this.$('.secondary-menu-inner').width(newWidth);
			}, this));
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
			});

			this.listenTo(this.slider, 'change:active', this.setActiveMenuItem);
		},

		setActiveMenuItem: function(key) {

			this.options.page = key;
			this.$menuItems.removeClass('active');
			var $activeMenuItem = this.$menuItems.filter('[data-key="' + key + '"]').addClass('active');
			// Set the menu scroll position to the active menu item.
			this.$('.secondary-menu')[0].scrollLeft = $activeMenuItem[0].offsetLeft;
			app.router.navigate('#admin/' + encodeURIComponent(key), { trigger: false });
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
			this.updateSecondaryMenuWidth();
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
			this.updateSecondaryMenuWidth();
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
			} else if (defaultSubPage && page === defaultSubPage.key) {
				app.router.navigate('pay', { trigger: true });
			} else {
				app.router.navigate('admin', { trigger: true });
			}
		}
	});

})();
