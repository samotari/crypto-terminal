var app = app || {};

app.views = app.views || {};

app.views.GettingStartedWelcome = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'getting-started getting-started-welcome',
		template: '#template-getting-started-welcome',

		title: function() {

			return app.i18n.t('getting-started.welcome.title');
		},

		serializeData: function() {

			return {
				recommendedHardwareWallets: app.config.recommendations.hardwareWallets,
			};
		},
	});

})();
