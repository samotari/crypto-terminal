var app = app || {};

app.views = app.views || {};

app.views.GettingStartedGeneralSettings = (function() {

	'use strict';

	return app.views.utility.Form.extend({

		className: 'getting-started getting-started-general-settings',
		template: '#template-getting-started-general-settings',

		serializeData: function() {

			var data = {
				isComplete: this.isComplete(),
			};

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

			data.settings = settings;

			return data;
		},

		save: function(data) {

			app.settings.set(data);
		},

		isComplete: function() {

			return true;
		},

	});

})();
