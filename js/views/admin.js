var app = app || {};

app.views = app.views || {};

app.views.Admin = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'admin',
		template: '#template-admin',

		events: {
			'quicktouch label[for^="settings-configurableCryptoCurrencies-"]': 'onQuickTouchCryptoCurrencyToggle',
			'quicktouch .secondary-menu-item': 'onQuickTouchNavMenuItem',
			'keyup input[name$=".extendedPublicKey"]': 'onKeyUpExtendedPublicKeyField',
		},

		sampleAddressesViews: {},

		subPages: function() {

			var subPages = [];

			// General settings.
			subPages.push({
				key: 'general-settings',
				label: app.i18n.t('admin.general-settings.label'),
				ContentView: app.views.SettingsGeneral,
				visible: true,
			});

			var configurableCryptoCurrencies = app.settings.get('configurableCryptoCurrencies');

			// Payment method settings.
			_.each(app.paymentMethods, function(paymentMethod, key) {
				subPages.push({
					key: key,
					label: _.result(paymentMethod, 'label'),
					ContentView: app.views.SettingsPaymentMethod,
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

		onKeyUpExtendedPublicKeyField: function(evt) {

			// To prevent the sample addresses from being updated too quickly (ie. while the user is typing).
			clearTimeout(this.updateSampleAddressesTimeout);
			var updateSampleAddresses = _.bind(this.updateSampleAddresses, this, evt);
			this.updateSampleAddressesTimeout = setTimeout(updateSampleAddresses, 400);
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

		onQuickTouchNavMenuItem: function(evt) {

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

		onQuickTouchCryptoCurrencyToggle: function(evt) {

			var $target = $(evt.target);
			var key = $target.attr('data-key');
			this.toggleCryptoCurrency(key);
		},

		toggleCryptoCurrency: function(key) {

			var $input = this.$(':input[value="' + key + '"]');
			var isChecked = $input.is(':checked');
			$input.prop('checked', !isChecked).trigger('change');
			this.setCryptoCurrencySettingsVisibility(key, !isChecked);
			this.updateSecondaryMenuWidth();
		},

		updateCryptoCurrencySettingsVisibility: function() {

			var configurableCryptoCurrencies = app.settings.get('configurableCryptoCurrencies') || [];
			_.each(_.keys(app.paymentMethods), function(key) {
				var visible = _.contains(configurableCryptoCurrencies, key);
				this.setCryptoCurrencySettingsVisibility(key, visible);
			}, this);
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

		onClose: function() {

			if (this.slider) {
				this.slider.close();
			}
		},

		updateSampleAddresses: function(evt) {

			var $target = $(evt.target);
			var fieldName = $target.attr('name');
			var view = this.sampleAddressesViews[fieldName];

			if (!view) {
				view = new app.views.SampleAddresses();
				this.sampleAddressesViews[fieldName] = view;
				$target.after(view.el);
			}

			var key = fieldName.split('.')[0];
			var paymentMethod = app.paymentMethods[key];
			var derivationScheme = app.settings.get(paymentMethod.ref + '.derivationScheme');
			var extendedPublicKey = $target.val();

			async.times(app.config.numberOfSampleAddressesToShow, function(index, next) {
				paymentMethod.deriveAddress(extendedPublicKey, derivationScheme, index, function(error, address) {
					if (error) return next(error);
					next(null, {
						index: index,
						address: address,
					});
				});
			}, _.bind(function(error, addresses) {
				if (error) {
					app.log(error);
					view.close();
					view = this.sampleAddressesViews[fieldName] = null;
				} else {
					view.options.addresses = addresses;
					view.render();
				}
			}, this));
		},

		onBackButton: function() {

			var page = this.options.page;
			var defaultSubPage = this.getDefaultSubPage();

			if (defaultSubPage && page === defaultSubPage.key) {
				app.router.navigate('pay', { trigger: true });
			} else {
				app.router.navigate('admin', { trigger: true });
			}
		}
	});

})();
