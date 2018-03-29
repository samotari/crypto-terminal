var app = app || {};

app.views = app.views || {};

app.views.MoreMenu = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({
		template: '#template-more-menu',
	});

})();
