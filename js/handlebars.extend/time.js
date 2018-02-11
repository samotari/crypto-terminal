(function() {

	'use strict';

	Handlebars.registerHelper('formatDate', function(datetime, format) {

		if (moment) {
			return moment(datetime).format(format);
		} else {
			return datetime;
		}
	});

})();
