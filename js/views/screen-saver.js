var app = app || {};

app.views = app.views || {};

app.views.ScreenSaver = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		template: '#template-screen-saver',
		className: 'screen-saver',

		serializeData: function() {

			var data = {};
			var acceptedCryptoCurrencies = app.settings.getAcceptedCryptoCurrencies();
			if (_.contains(acceptedCryptoCurrencies, 'bitcoinLightning') && _.contains(acceptedCryptoCurrencies, 'bitcoin')) {
				acceptedCryptoCurrencies = _.without(acceptedCryptoCurrencies, 'bitcoin');
			}
			data.acceptedCryptoCurrencies = acceptedCryptoCurrencies;
			return data;
		},

	});

})();
