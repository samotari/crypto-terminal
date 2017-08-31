(function() {

    'use strict';

	Handlebars.registerHelper('if_deep_eq', function(a, b, options) {
		if (a === b) 
			return options.fn(this);
		else {
			return options.inverse(this);
		}
	});

})();
