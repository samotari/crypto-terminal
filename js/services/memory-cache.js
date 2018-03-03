'use strict';

app.services.memoryCache = (function() {

	return {
		data: {},
		clear: function(key) {
			this.data[key] = null;
		},
		clearAll: function() {
			this.data = {};
		},
		get: function(key, maxAge) {
			var data = null;
			if (this.data[key]) {
				var expired = maxAge && Date.now() - this.data[key].timestamp > maxAge;
				if (!expired) {
					data = this.data[key].data;
				}
			}
			return data;
		},
		set: function(key, data) {
			this.data[key] = {
				timestamp: Date.now(),
				data: data,
			};
		}
	};

})();
