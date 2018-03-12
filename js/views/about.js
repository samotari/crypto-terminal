var app = app || {};

app.views = app.views || {};

app.views.About = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		template: '#template-about',
		className: 'about',

		serializeData: function() {

			return _.clone(app.info);
		},

	});

})();
