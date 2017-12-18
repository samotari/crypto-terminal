(function() {

    'use strict';

	Handlebars.registerHelper('i18n', function() {
		return app.i18n.t.apply(app.i18n, arguments);
	});

})();
