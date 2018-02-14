var app = app || {};

app.views = app.views || {};

app.views.LanguageMenu = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		template: '#template-language-menu',

		serializeData: function() {

			var data = {};
			data.languages = _.map(_.keys(app.lang), function(key) {
				return {
					key: key,
					label: app.i18n.t('language.' + key)
				};
			});
			return data;
		},

	});

})();
