var app = app || {};

app.views = app.views || {};

app.views.RecommendedMobileWallets = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'recommended-mobile-wallets',
		template: '#template-recommended-mobile-wallets',

		serializeData: function() {

			var data = {};
			var acceptedCryptoCurrencies = app.settings.getAcceptedCryptoCurrencies();
			data.recommendations = _.map(app.config.recommendations.mobileWallets, function(mobileWallets, platform) {
				var title = app.i18n.t('recommended-mobile-wallets.section-title.' + platform);
				return {
					title: title,
					mobileWallets: _.chain(mobileWallets).filter(function(mobileWallet) {
						return _.some(mobileWallet.paymentMethods, function(paymentMethod) {
							return _.contains(acceptedCryptoCurrencies, paymentMethod);
						});
					}).map(function(mobileWallet) {
						mobileWallet = _.clone(mobileWallet);
						mobileWallet.paymentMethods = _.intersection(mobileWallet.paymentMethods, acceptedCryptoCurrencies);
						return mobileWallet;
					}).value(),
				};
			});

			return data;
		},

		onRender: function() {

			this.renderItemQrCodes();
		},

		renderItemQrCodes: function() {

			var $items = this.$('.recommendations-group-item');

			async.times($items.length, function(index, next) {

				var $item = $items.eq(index);
				var $target = $item.find('.recommendations-group-item-qr-code');
				var data = $target.attr('data-url');
				if (!data) return next();
				var options = {
					width: $target.width(),
					height: $target.height(),
					margin: 1,
				};

				app.util.renderQrCode($target, data, options, function(error) {

					if (error) {
						app.log('Failed to render QR code', error);
					}

					next();
				});
			});
		},
	});
})();
