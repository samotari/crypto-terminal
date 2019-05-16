var app = app || {};

app.views = app.views || {};

app.views.GettingStartedWelcome = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'getting-started getting-started-welcome',
		template: '#template-getting-started-welcome',

		events: {
			'click .skip': 'skip',
		},

		title: function() {

			return app.i18n.t('getting-started.welcome.title');
		},

		skip: function() {

			if (confirm(app.i18n.t('getting-started.welcome.skip-confirm'))) {
				// User really wants to skip the guided setup.
				app.markGettingStartedAsComplete();
				app.router.navigate('admin', { trigger: true });
			} else {
				// Canceled skip - do nothing.
			}
		},
	});

})();
