var app = app || {};

app.views = app.views || {};

app.views.About = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		template: '#template-about',
		className: 'about',

		serializeData: function() {

			var data = _.clone(app.info);
			data.supportEmail = app.config.supportEmail;
			return data;
		},

	});

})();
