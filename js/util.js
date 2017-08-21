var app = app || {};

app.util = (function() {

	'use strict';

	return {
		generateRandomString: function(length, charset) {
			var randString = '';;
			charset = charset || 'abcdefghijklmnopqrstuvqxyzABCDEFGHIJKLMNOPQRSTUVQXYZ1234567890';
			if (typeof charset === 'string') {
				charset = charset.split('');
			}
			while (randString.length < length) {
				randString += charset[ Math.floor(Math.random() * charset.length) ];
			}
			return randString;
		},
		extend: function() {
			var args = Array.prototype.slice.call(arguments);
			return _.extend.apply(_, [{}].concat(args));
		}
	};

})();
