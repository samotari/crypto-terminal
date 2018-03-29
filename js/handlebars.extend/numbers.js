(function() {

	'use strict';

	Handlebars.registerHelper('formatNumber', function(number, format) {
		return app.util.formatNumber(number, format);
	});

})();
