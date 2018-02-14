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

		initialize: function() {

			_.bindAll(this, 'setActiveMenuItem', 'toggleCryptoCurrency', 'goToSubPage');
			this.toggleCryptoCurrency = _.throttle(this.toggleCryptoCurrency, 50);
			this.goToSubPage = _.throttle(this.goToSubPage, 50);
			this.options.page = this.options.page || 'general-settings';
		},

		onKeyUpExtendedPublicKeyField: function(evt) {

			// To prevent the sample addresses from being updated too quickly (ie. while the user is typing).
			clearTimeout(this.updateSampleAddressesTimeout);
			var updateSampleAddresses = _.bind(this.updateSampleAddresses, this, evt);
			this.updateSampleAddressesTimeout = setTimeout(updateSampleAddresses, 400);
		},

		serializeData: function() {

			var data = {};

			data.paymentMethods = _.map(app.paymentMethods, function(paymentMethod, key) {
				return {
					key: key,
					label: _.result(paymentMethod, 'label'),
				};
			});

			data.menuItems = [
				{
					key: 'general-settings',
					label: app.i18n.t('admin.general-settings.label'),
				}
			].concat(_.map(data.paymentMethods, function(paymentMethod) {
				return {
					key: paymentMethod.key,
					label: _.result(paymentMethod, 'label'),
				};
			}), [
				{
					key: 'payment-history',
					label: app.i18n.t('admin.payment-history.label'),
				}
			]);

			return data;
		},

		onRender: function() {

			this.$menuItems = this.$('.secondary-menu-item');
			this.$menuItems.filter('.general-settings,.payment-history').addClass('visible');
			this.initializeSlider();
			this.updateCryptoCurrencySettingsVisibility();

			if (this.options.page) {
				this.slider.switchToItem(this.options.page);
				this.setActiveMenuItem(this.options.page);
			}

			this.updateSecondaryMenuWidth();
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
				var secondaryMenuItemsWidth = 0;
				// Add some extra width to ensure no wrapping.
				secondaryMenuItemsWidth += 60;
				this.$('.secondary-menu-item').each(function() {
					if ($(this).is(':visible')) {
						secondaryMenuItemsWidth += $(this).outerWidth();
					}
				});
				this.$('.secondary-menu-inner').width(secondaryMenuItemsWidth);
			}, this));
		},

		initializeSlider: function() {

			var items = [
				{
					key: 'general-settings',
					contentView: new app.views.SettingsGeneral(),
				}
			];

			_.each(_.keys(app.paymentMethods), function(key) {
				items.push({
					key: key,
					contentView: new app.views.SettingsPaymentMethod({ key: key })
				});
			}, this);

			items = items.concat([
				{
					key: 'payment-history',
					contentView: new app.views.PaymentHistory(),
				}
			]);

			this.slider = new app.views.Slider({
				el: this.$('.slider'),
				items: items
			});

			this.listenTo(this.slider, 'change:active', this.setActiveMenuItem);
			this.slider.showItems('general-settings', 'payment-history');
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

			var page = app.mainView.currentView.options.page;

			if (page === 'general-settings') {
				app.router.navigate('pay', { trigger: true });
			} else {
				app.router.navigate('admin', { trigger: true });
			}
		}
	});

})();
