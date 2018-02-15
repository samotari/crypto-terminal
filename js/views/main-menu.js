var app = app || {};

app.views = app.views || {};

app.views.MainMenu = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		template: '#template-main-menu',

	});

})();
