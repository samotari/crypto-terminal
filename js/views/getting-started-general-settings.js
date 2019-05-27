var app = app || {};

app.views = app.views || {};

app.views.GettingStartedGeneralSettings = (function() {

	'use strict';

	return app.views.utility.Form.extend({

		className: 'getting-started getting-started-general-settings',
		template: '#template-getting-started-general-settings',

		inputs: function() {

			return _.filter(app.config.settings, function(setting) {
				return setting.name !== 'configurableCryptoCurrencies';
			});
		},

		title: function() {

			return app.i18n.t('getting-started.general-settings.title');
		},

		serializeData: function() {

			var data = app.views.utility.Form.prototype.serializeData.apply(this, arguments);
			data.isComplete = this.isComplete();
			return data;
		},

		isComplete: function() {

			return true;
		},

	});

})();
