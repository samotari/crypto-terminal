var app = app || {};

app.views = app.views || {};

app.views.GettingStartedGeneralSettings = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({
		className: 'getting-started getting-started-general-settings',
		template: '#template-getting-started-general-settings',
		serializeData: function() {
			return {
				title: app.i18n.t('getting-started.general-settings.title'),
				instructions: app.i18n.t('getting-started.general-settings.instructions'),
			};
		},
	});

})();
