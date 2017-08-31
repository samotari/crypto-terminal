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
		},



		// Monero Address Validation
		// https://xmr.llcoins.net/addresstests.html (site.js)
		hextobin: function (hex){
		    if (hex.length % 2 !== 0) throw "Hex string has invalid length!";
		        var res = new Uint8Array(hex.length / 2);
		    for (var i = 0; i < hex.length / 2; ++i) {
		        res[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
		    }
		    return res;
		},

	};

})();
