var app = app || {};

app.views = app.views || {};

app.views.Settings = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'settings',
		template: '#template-settings',

		events: {
			'change input[name="configurableCryptoCurrencies[]"]': 'toggleCryptoCurrencySettingsVisibility',
		},

		initialize: function() {

			_.bindAll(this, 'onSliderChangeActive');
			this.options.page = this.options.page || 'general';
		},

		serializeData: function() {

			var data = {};

			data.paymentMethods = _.map(app.paymentMethods, function(paymentMethod, key) {
				return {
					key: key,
					label: _.result(paymentMethod, 'label')
				};
			});

			data.menuItems = [
				{
					key: 'general',
					label: app.i18n.t('settings.general.label'),
					active: this.options.page === 'general'
				}
			];

			_.each(data.paymentMethods, function(paymentMethod) {
				data.menuItems.push(_.extend({}, paymentMethod, {
					active: this.options.page === paymentMethod.key
				}));
			}, this);

			return data;
		},

		onRender: function() {

			this.initializeSlider();
			this.toggleCryptoCurrencySettingsVisibility();

			if (this.options.page) {
				this.slider.switchToItem(this.options.page);
			}
		},

		initializeSlider: function() {

			var items = [
				{
					key: 'general',
					contentView: new app.views.SettingsGeneral()
				}
			];

			_.each(_.keys(app.paymentMethods), function(key) {
				items.push({
					key: key,
					contentView: new app.views.SettingsPaymentMethod({ key: key })
				});
			}, this);

			this.slider = new app.views.Slider({
				el: this.$('.slider'),
				items: items
			});

			this.slider.on('change:active', this.onSliderChangeActive);
		},

		onSliderChangeActive: function(key) {

			this.options.page = key;
			this.$('.secondary-menu-item').removeClass('active');
			var $menuItem = this.$('.secondary-menu-item[data-key="' + key + '"]');
			$menuItem.addClass('active');
			var url = $menuItem.attr('href');
			app.router.navigate(url);
		},

		toggleCryptoCurrencySettingsVisibility: function() {

			var configurableCryptoCurrencies = app.settings.get('configurableCryptoCurrencies') || [];
			var $menuItems = this.$('.secondary-menu-item');
			var $sliderItems = this.$('.slider-item');
			_.each(_.keys(app.paymentMethods), function(key) {
				var configurable = _.contains(configurableCryptoCurrencies, key);
				var method = configurable ? 'show' : 'hide';
				$menuItems.filter('[data-key="' + key + '"]')[method]();
				$sliderItems.filter('[data-key="' + key + '"]')[method]();
			});
		},

		onClose: function() {

			if (this.slider) {
				this.slider.close();
			}
		}

	});

})();
