var app = app || {};

app.collections = app.collections || {};

app.collections.PaymentRequests = (function() {

	'use strict';

	return Backbone.Collection.extend({
		
		model: app.models.PaymentRequest,

		localStorage: new Backbone.LocalStorage('PR'),

		comparator: function(model) {
			return -model.attributes.timestamp;
		}

	});

})();