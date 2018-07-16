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

			var settings = app.views.AdminGeneralSettings.prototype.prepareGenearalSettings();

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
