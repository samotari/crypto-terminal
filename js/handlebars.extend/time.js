(function() {

	'use strict';

	Handlebars.registerHelper('formatDate', function(datetime, format, options) {
		if (_.isUndefined(options)) {
			options = format;
			format = null;
		}
		return app.util.formatDate(datetime, format);
	});

})();
