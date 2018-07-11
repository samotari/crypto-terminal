var app = app || {};

app.views = app.views || {};

app.views.GettingStartedWelcome = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({
		className: 'getting-started getting-started-welcome',
		template: '#template-getting-started-welcome',
		serializeData: function() {
			return {
				title: app.i18n.t('getting-started.welcome.title'),
				instructions: app.i18n.t('getting-started.welcome.instructions'),
			};
		},
	});

})();
