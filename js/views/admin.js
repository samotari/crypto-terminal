var app = app || {};

app.views = app.views || {};

app.views.Admin = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'admin',
		template: '#template-admin',

		events: {
			'change input[name="configurableCryptoCurrencies[]"]': 'toggleCryptoCurrencySettingsVisibility',
			'keyup input[name$=".xpub"]': 'onKeyUpMasterPublicKeyField',
			'click .lock': 'lock',
		},

		sampleAddressesViews: {},

		initialize: function() {

			_.bindAll(this, 'setActiveMenuItem');
			this.options.page = this.options.page || 'general-settings';
		},

		lock: function() {

			app.lock();
			app.router.navigate('pay', { trigger: true });
		},

		onKeyUpMasterPublicKeyField: function(evt) {

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
			this.initializeSlider();
			this.toggleCryptoCurrencySettingsVisibility();

			// Always show these admin pages.
			this.$menuItems
				.filter('.general-settings,.payment-history')
				.addClass('visible');

			if (this.options.page) {
				this.slider.switchToItem(this.options.page);
			}

			this.updateSecondaryMenuWidth();
		},

		onResize: function() {

			this.updateSecondaryMenuWidth();
		},

		updateSecondaryMenuWidth: function() {

			var secondaryMenuItemsWidth = 0;
			this.$('.secondary-menu-item').each(function() {
				if ($(this).is(':visible')) {
					secondaryMenuItemsWidth += $(this).outerWidth();
				}
			});
			this.$('.secondary-menu-inner').width(secondaryMenuItemsWidth);
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

			// Always show these admin pages.
			this.slider.$('.slider-item')
				.filter('.general-settings,.payment-history')
				.addClass('visible');
		},

		setActiveMenuItem: function(key) {

			this.options.page = key;
			this.$menuItems.removeClass('active');
			var $activeMenuItem = this.$menuItems.filter('[data-key="' + key + '"]').addClass('active');
			// Set the menu scroll position to the active menu item.
			this.$('.secondary-menu')[0].scrollLeft = $activeMenuItem[0].offsetLeft;
			app.router.navigate('#admin/' + encodeURIComponent(key));
		},

		toggleCryptoCurrencySettingsVisibility: function() {

			var configurableCryptoCurrencies = app.settings.get('configurableCryptoCurrencies') || [];
			_.each(_.keys(app.paymentMethods), function(key) {
				var configurable = _.contains(configurableCryptoCurrencies, key);
				this.$menuItems
					.filter('[data-key="' + key + '"]')
					.toggleClass('visible', configurable);
				this.slider.$('.slider-item')
					.filter('[data-key="' + key + '"]')
					.toggleClass('visible', configurable);
			}, this);
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

			try {
				var paymentMethodName = fieldName.split('.')[0];
				var paymentMethod = app.paymentMethods[paymentMethodName];
				var xpub = $target.val();
				var node = paymentMethod.prepareHDNodeInstance(xpub);
				var addresses = [];
				var index = 0;
				while (addresses.length < app.config.numberOfSampleAddressesToShow) {
					addresses.push({
						index: index,
						address: node.derive(0).derive(index++).getAddress().toString()
					});
				}
				view.options.addresses = addresses;
				view.render();
			} catch (error) {
				view.close();
				view = this.sampleAddressesViews[fieldName] = null;
			}
		}

	});

})();
