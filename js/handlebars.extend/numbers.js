(function() {

	'use strict';

	Handlebars.registerHelper('formatNumber', function(number, paymentMethod) {
		var options = {
			paymentMethod: paymentMethod || null,
		};
		return app.util.formatNumber(number, options);
	});

})();
