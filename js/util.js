var app = app || {};

app.util = (function() {

	'use strict';

	return {
		extend: function() {
			var args = Array.prototype.slice.call(arguments);
			return _.extend.apply(_, [{}].concat(args));
		}
	};

})();
