var app = app || {};

app.views = app.views || {};

app.views.GettingStartedGeneralSettings = (function() {

	'use strict';

	return app.views.utility.Form.extend({
		className: 'getting-started getting-started-general-settings',
		template: '#template-getting-started-general-settings',

		serializeData: function() {

			// Prepare general settings for the template.
			var settings = _.map(app.config.settings, function(setting) {
				switch (setting.type) {
					case 'select':
						setting.options = _.map(setting.options || [], function(option) {
							return {
								key: option.key,
								label: _.result(option, 'label'),
								selected: app.settings.get(setting.name) === option.key
							}
						});
						break;

					default:
						setting.value = app.settings.get(setting.name);
						break;
				}
				setting.id = ['settings', setting.name].join('-');
				return setting;
			});

			return {
				settings: settings,
				title: app.i18n.t('getting-started.general-settings.title'),
				instructions: app.i18n.t('getting-started.general-settings.instructions')
			};
		},

		save: function(data) {
			app.settings.set(data);
		},
	});

})();
