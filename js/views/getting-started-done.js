var app = app || {};

app.views = app.views || {};

app.views.GettingStartedDone = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'getting-started getting-started-done',
		template: '#template-getting-started-done',

		events: {
			'click .done': 'done',
		},

		serializeData: function() {
			return {
				title: app.i18n.t('getting-started.done.title'),
				instructions: app.i18n.t('getting-started.done.instructions'),
				supportEmail: app.config.supportEmail,
			};
		},

		done: function() {

			app.markGettingStartedAsComplete();
			app.router.navigate('pay', { trigger: true });
		},
	});

})();
